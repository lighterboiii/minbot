const fs = require("fs");
const insultsOfDay = require("../data/insultsOfDay");
const BRATDNYA_FILE = 'storage/bratdnya.json';
const USERS_OF_DAY_FILE = 'storage/usersOfDay.json';
const { withLock } = require("./lock");

function getTodayStr() {
  const now = new Date();
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

function saveBratDnya(data) {
  fs.writeFileSync(BRATDNYA_FILE, JSON.stringify(data));
}

function loadBratDnya() {
  if (!fs.existsSync(BRATDNYA_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(BRATDNYA_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function resetBratDnya() {
  if (fs.existsSync(BRATDNYA_FILE)) fs.unlinkSync(BRATDNYA_FILE);
}

function sendBratDnya(bot, chatId, forceNew = false) {
  const today = getTodayStr();
  let brat = loadBratDnya();
  if (brat && brat.date === today && !forceNew) {
    const insult = insultsOfDay[Math.floor(Math.random() * insultsOfDay.length)];
    const mention = brat.user.username ? `@${brat.user.username}` : brat.user.first_name || 'братец';
    const text = `Братик дня уже выбран, сегодня ${insult} дня — ${mention}`;
    bot.sendMessage(chatId, text);
    return;
  }
  if (!fs.existsSync(USERS_OF_DAY_FILE)) return;
  let arr = [];
  try { arr = JSON.parse(fs.readFileSync(USERS_OF_DAY_FILE, 'utf8')); } catch {}
  if (!arr.length) return;
  const user = arr[Math.floor(Math.random() * arr.length)];
  const insult = insultsOfDay[Math.floor(Math.random() * insultsOfDay.length)];
  const mention = user.username ? `@${user.username}` : user.first_name || 'братец';
  const text = `Сегодня ${insult} дня — ${mention}! Поздравляем, братик! Иди ка нахуй теперь давай поскорее.`;
  saveBratDnya({ date: today, user });
  bot.sendMessage(chatId, text);
}

function handleBratdnyaCommand(bot, chatId) {
  bot.onText(/\/bratdnya/, withLock((msg) => {
    sendBratDnya(bot, msg.chat.id);
  }));
}

module.exports = {
  handleBratdnyaCommand,
  sendBratDnya,
  saveBratDnya,
  loadBratDnya,
  resetBratDnya
};
