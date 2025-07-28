const { saveUserOfDay } = require("./utils");
const { savePhotoId } = require("./photo");
const { saveStickerId } = require("./stickers");
const { saveGifId, getRandomGifId } = require("./gifs");
const { saveRound, getRandomRoundId } = require("./rounds");
const phrases = require("../data/phrases");
const { getRandomPhotoId } = require("./photo");
const { getRandomStickerId } = require("./stickers");

const TARGET_USER_ID = 168853874;

function getRandomPhrase() {
  if (!Array.isArray(phrases) || !phrases.length) return null;
  return phrases[Math.floor(Math.random() * phrases.length)];
}
function randomReaction(bot, chatId, replyToMessageId = null) {
  const options = [];
  if (getRandomPhrase()) options.push('phrase');
  if (getRandomStickerId()) options.push('sticker');
  if (typeof getRandomGifId === 'function' && getRandomGifId()) options.push('gif');
  if (getRandomPhotoId()) options.push('photo');
  if (getRandomRoundId()) options.push('round');

  if (!options.length) return;
  const pick = options[Math.floor(Math.random() * options.length)];
  const sendOpts = replyToMessageId ? { reply_to_message_id: replyToMessageId } : {};
  switch (pick) {
    case 'phrase': {
      const phrase = getRandomPhrase();
      if (phrase) bot.sendMessage(chatId, phrase, sendOpts);
      break;
    }
    case 'sticker': {
      const stickerId = getRandomStickerId();
      if (stickerId) bot.sendSticker(chatId, stickerId, sendOpts);
      break;
    }
    case 'gif': {
      const gifId = getRandomGifId();
      if (gifId) bot.sendAnimation(chatId, gifId, sendOpts);
      break;
    }
    case 'photo': {
      const fileId = getRandomPhotoId();
      if (fileId) bot.sendPhoto(chatId, fileId, sendOpts);
      break;
    }
    case 'round': {
      const roundId = getRandomRoundId();
      if (roundId) bot.sendVideoNote(chatId, roundId, sendOpts);
      break;
    }
  }
}

function randomReactionToChat(bot, chatId) {
  randomReaction(bot, chatId);
}

function randomReactionToMessage(bot, chatId, messageId) {
  randomReaction(bot, chatId, messageId);
}

function savePhrase(phrase) {
  if (!phrase || typeof phrase !== 'string') return;
  let phrasesArr = [];
  try {
    phrasesArr = require('../data/phrases');
  } catch {}
  if (!phrasesArr.includes(phrase)) {
    phrasesArr.push(phrase);
    const fs = require('fs');
    const path = require('path');
    const PHRASES_PATH = path.join(__dirname, '../data/phrases.js');
    const content = `module.exports = ${JSON.stringify(phrasesArr, null, 2)};\n`;
    fs.writeFileSync(PHRASES_PATH, content, 'utf8');
  }
}

function handleBotEvents(bot) {
  let botId = null;
  let botUsername = null;
  const botStartTime = Math.floor(Date.now() / 1000); // время запуска бота
  bot.getMe().then((me) => {
    botId = me.id;
    botUsername = me.username;
  });

  bot.on(
    "message",
    (msg) => {
      // Игнорировать сообщения, отправленные до запуска бота (с запасом 10 сек)
      if (msg.date < botStartTime - 10) return;
      const chatId = msg.chat.id;
      let handled = false;

      // 1. Reply на сообщение бота
      if (!handled && msg.reply_to_message && botId && msg.reply_to_message.from.id === botId) {
        // 2% шанс отправить кружок, иначе фраза
        if (Math.random() < 0.02) {
          const roundId = getRandomRoundId();
          if (roundId) bot.sendVideoNote(chatId, roundId, { reply_to_message_id: msg.message_id });
        } else {
          const phrase = getRandomPhrase();
          if (phrase) bot.sendMessage(chatId, phrase, { reply_to_message_id: msg.message_id });
        }
        handled = true;
        return;
      }

      // Персональная реакция с оскорблением
      // if (!handled && msg.from.id === SLAVA_ID) {
      //   if (Math.random() < 0.03) {
      //     const randomInsult =
      //       insults[Math.floor(Math.random() * insults.length)];
      //     bot.sendMessage(chatId, randomInsult, {
      //       reply_to_message_id: msg.message_id,
      //     });
      //   }
      //   handled = true;
      //   return;
      // }

      if (
        !handled &&
        msg.photo &&
        Array.isArray(msg.photo) &&
        msg.photo.length > 0
      ) {
        const largest = msg.photo[msg.photo.length - 1];
        savePhotoId(largest.file_id);
      }

      // Сохраняем file_id стикеров
      if (!handled && msg.sticker) {
        saveStickerId(msg.sticker.file_id);
      }

      // Сохраняем file_id гифок
      if (!handled && msg.animation && msg.animation.file_id) {
        saveGifId(msg.animation.file_id);
      }
      if (
        !handled &&
        msg.document &&
        (msg.document.mime_type === "video/mp4" ||
          msg.document.mime_type === "image/gif") &&
        msg.document.file_id
      ) {
        saveGifId(msg.document.file_id);
      }

      // Реакция на упоминание бота через @username
      if (
        !handled &&
        msg.text &&
        botUsername &&
        msg.text.toLowerCase().includes("@" + botUsername.toLowerCase())
      ) {
        let userText = msg.text
          .replace(new RegExp("@" + botUsername, "ig"), "")
          .trim();
        const answer = `Сам ты ${userText} братик\n\nЯ вот что могу:\n/weather — покажу погоду\n/news — пришлю подборку свежих новостей\n/bratdnya — выберу \"брата дня\"\n/pivko — выберу, кто угощает пивком\n/mezcal — выберу, кто угощает мескаликом\n/prognoz – что то наговорю вам`;
        bot.sendMessage(chatId, answer, {
          reply_to_message_id: msg.message_id,
        });
        handled = true;
        return;
      }

      // Сохраняем пользователя для братдня
      if (msg.from && msg.from.id) {
        saveUserOfDay(msg.from);
      }

      // Сохраняем фразы определённого юзера
      if (msg.from && msg.from.id === TARGET_USER_ID && msg.text && typeof msg.text === 'string') {
        savePhrase(msg.text);
      }

      // Рандомная реакция: либо reply, либо просто в чат, с вероятностью 8%
      if (
        !handled &&
        msg.from &&
        botId &&
        msg.from.id !== botId &&
        !(msg.text && msg.text.startsWith('/')) &&
        Math.random() < 0.08
      ) {
        if (Math.random() < 0.5) {
          randomReactionToMessage(bot, chatId, msg.message_id);
        } else {
          randomReactionToChat(bot, chatId);
        }
        handled = true;
        return;
      }
    }
  );

  bot.on('video_note', (msg) => {
    if (msg.from && msg.from.id === TARGET_USER_ID && msg.video_note && msg.video_note.file_id) {
      saveRound(msg.video_note.file_id);
    }
  });
}

module.exports = { handleBotEvents, randomReactionToChat, randomReactionToMessage };
