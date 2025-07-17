const fs = require("fs");
const USERS_OF_DAY_FILE = "usersOfDay.json";

// Кулдаун в миллисекундах (1 час)
const DRINKS_COOLDOWN = 60 * 60 * 1000;
if (!global.drinksCooldowns) global.drinksCooldowns = {};

function formatTime(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  if (min > 0) return `Братики, вы разравняли меня уже. Ждите ${min} мин. ${sec} сек, чтобы снова определить, кто сегодня угощает.`;
  return `${sec} сек.`;
}

function handleDrinksCommands(bot) {
  bot.onText(/\/pivko/, (msg) => {
    const chatId = msg.chat.id;
    const now = Date.now();
    const key = `${chatId}_pivko`;
    const last = global.drinksCooldowns[key] || 0;
    if (now - last < DRINKS_COOLDOWN) {
      const wait = DRINKS_COOLDOWN - (now - last);
      bot.sendMessage(chatId, `Чек за пивко недавно уже был! Ждите ещё ${formatTime(wait)}`);
      return;
    }
    global.drinksCooldowns[key] = now;
    if (!fs.existsSync(USERS_OF_DAY_FILE)) return;
    let arr = [];
    try {
      arr = JSON.parse(fs.readFileSync(USERS_OF_DAY_FILE, "utf8"));
    } catch {}
    if (!arr.length) return;
    const user = arr[Math.floor(Math.random() * arr.length)];
    const mention = user.username
      ? `@${user.username}`
      : user.first_name || "братец";
    const text = `Чек за пивко сегодня на ${mention}, сегодня твоя очередь разравнивать корешей!`;
    bot.sendMessage(chatId, text);
  });

  bot.onText(/\/mezcal/, (msg) => {
    const chatId = msg.chat.id;
    const now = Date.now();
    const key = `${chatId}_mezcal`;
    const last = global.drinksCooldowns[key] || 0;
    if (now - last < DRINKS_COOLDOWN) {
      const wait = DRINKS_COOLDOWN - (now - last);
      bot.sendMessage(chatId, `Чек за мескалик недавно уже был! Ждите ещё ${formatTime(wait)}`);
      return;
    }
    global.drinksCooldowns[key] = now;
    if (!fs.existsSync(USERS_OF_DAY_FILE)) return;
    let arr = [];
    try {
      arr = JSON.parse(fs.readFileSync(USERS_OF_DAY_FILE, "utf8"));
    } catch {}
    if (!arr.length) return;
    const user = arr[Math.floor(Math.random() * arr.length)];
    const mention = user.username
      ? `@${user.username}`
      : user.first_name || "братец";
    const text = `Чек за мескалик сегодня на ${mention}, сегодня твоя очередь угощать братцев!`;
    bot.sendMessage(chatId, text);
  });
}

module.exports = { handleDrinksCommands }; 