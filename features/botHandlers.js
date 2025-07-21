const { saveUserOfDay } = require("./utils");
const { savePhotoId } = require("./photo");
const { saveStickerId } = require("./stickers");
const { saveGifId, getRandomGifId } = require("./gifs");
const phrases = require("../data/phrases");
const stickerIds = require("../data/stickerIds");
const emojis = require("../data/emojis");
const insults = require("../data/insults");

const SLAVA_ID = 653015244;

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
      if (
        !handled &&
        msg.reply_to_message &&
        botId &&
        msg.reply_to_message.from.id === botId
      ) {
        const randomInsult = insults[Math.floor(Math.random() * insults.length)];
        bot.sendMessage(chatId, randomInsult, {
          reply_to_message_id: msg.message_id,
        });
        handled = true;
        return;
      }

      // Персональная реакция с оскорблением
      if (!handled && msg.from.id === SLAVA_ID) {
        if (Math.random() < 0.03) {
          const randomInsult =
            insults[Math.floor(Math.random() * insults.length)];
          bot.sendMessage(chatId, randomInsult, {
            reply_to_message_id: msg.message_id,
          });
        }
        handled = true;
        return;
      }

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
        const answer = `Сам ты ${userText} братик\n\nЯ вот что могу:\n/weather — покажу погоду\n/news — пришлю подборку свежих новостей\n/bratdnya — выберу \"брата дня\"\n/pivko — выберу, кто угощает пивком\n/mezcal — выберу, кто угощает мескаликом\n/photo – отправлю фотку из чата с комментарием (заблокировал ибо вы заспамили чат)\n/prognoz – что то наговорю вам`;
        bot.sendMessage(chatId, answer, {
          reply_to_message_id: msg.message_id,
        });
        handled = true;
        return;
      }

      // Игнорировать команды, кроме /start
      if (
        !handled &&
        msg.text &&
        msg.text.startsWith("/") &&
        !msg.text.startsWith("/start")
      ) {
        handled = true;
        return;
      }

      // С вероятностью 3% отправляем гифку, иначе обычную реакцию
      if (!handled && Math.random() < 0.014) {
        const gifId = getRandomGifId();
        if (gifId) {
          bot.sendAnimation(msg.chat.id, gifId, {
            reply_to_message_id: msg.message_id,
          });
          handled = true;
          return;
        }
        // Если гифок нет — обычная реакция
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        bot.sendMessage(msg.chat.id, randomEmoji, {
          reply_to_message_id: msg.message_id,
        });
        handled = true;
        return;
      }

      // С вероятностью 8% отвечаем фразой или стикером
      if (!handled && Math.random() < 0.04) {
        if (Math.random() < 0.2) {
          const randomSticker =
            stickerIds[Math.floor(Math.random() * stickerIds.length)];
          bot.sendSticker(chatId, randomSticker);
        } else {
          const randomPhrase =
            phrases[Math.floor(Math.random() * phrases.length)];
          bot.sendMessage(chatId, randomPhrase);
        }
        handled = true;
        return;
      }

      // Сохраняем пользователя для братдня
      if (msg.from && msg.from.id) {
        saveUserOfDay(msg.from);
      }
    }
  );
}

module.exports = { handleBotEvents };
