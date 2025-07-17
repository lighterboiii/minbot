let rouletteActive = false;
let rouletteParticipants = new Map();
let rouletteTimeout = null;

const rouletteShots = require("../data/rouletteShots");

function initRoulette(bot, chatIdGetter) {
  bot.onText(/\/roulette/, (msg) => {
    const chatId = chatIdGetter ? chatIdGetter(msg) : msg.chat.id;
    if (rouletteActive) {
      bot.sendMessage(chatId, "Игра уже идёт!");
      return;
    }
    rouletteActive = true;
    rouletteParticipants = new Map();
    bot.sendMessage(
      chatId,
      "Русская рулетка началась! Тыкай /shot или пиши любое сообщение, чтобы участвовать. У вас 1 минута!"
    );
    // Автоматически добавляем инициатора
    rouletteParticipants.set(msg.from.id, msg.from);
    rouletteTimeout = setTimeout(() => finishRoulette(bot, chatId), 60 * 1000);
  });

  bot.on("message", (msg) => {
    if (!rouletteActive) return;
    const chatId = chatIdGetter ? chatIdGetter(msg) : msg.chat.id;
    // Не добавлять сервисные сообщения и ботов
    if (!msg.from || msg.from.is_bot) return;
    // Участие по /shot или любому тексту (кроме /roulette)
    if (
      (msg.text &&
        (msg.text === "/shot" ||
          msg.text === "shot" ||
          msg.text === "+" ||
          msg.text === "стреляюсь" ||
          msg.text === "/shot@" + (bot.me && bot.me.username))) ||
      (msg.text && !msg.text.startsWith("/roulette"))
    ) {
      rouletteParticipants.set(msg.from.id, msg.from);
    }
  });
}

function finishRoulette(bot, chatId) {
  rouletteActive = false;
  if (rouletteTimeout) clearTimeout(rouletteTimeout);
  const participants = Array.from(rouletteParticipants.values());
  if (participants.length < 2) {
    bot.sendMessage(chatId, "нет братиков для игры");
    return;
  }
  const loser = participants[Math.floor(Math.random() * participants.length)];
  const insult = rouletteShots[Math.floor(Math.random() * rouletteShots.length)];
  const mention = loser.username
    ? `@${loser.username}`
    : loser.first_name || "братец";
  const text = `💥 В рулетке убит братец ${mention} и ${insult}`;
  bot.sendMessage(chatId, text).then((sentMsg) => {
    bot.pinChatMessage(chatId, sentMsg.message_id, {
      disable_notification: true,
    });
  });
  setTimeout(() => {
    bot.sendMessage(chatId, "Остальные выжили!");
  }, 100);
}

module.exports = { initRoulette };
