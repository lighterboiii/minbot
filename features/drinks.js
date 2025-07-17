const fs = require("fs");
const USERS_OF_DAY_FILE = "usersOfDay.json";

function handleDrinksCommands(bot) {
  bot.onText(/\/pivko/, (msg) => {
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
    bot.sendMessage(msg.chat.id, text);
  });

  bot.onText(/\/mezcal/, (msg) => {
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
    bot.sendMessage(msg.chat.id, text);
  });
}

module.exports = { handleDrinksCommands }; 