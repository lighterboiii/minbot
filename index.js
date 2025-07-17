require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { handleWeatherCommand } = require("./features/weather");
const { handleNewsCommand } = require("./features/news");
const { handlePhotoCommand, scheduleRandomPhotoCron } = require("./features/photo");
const { handleBratdnyaCommand, sendBratDnya, resetBratDnya } = require("./features/bratdnya");
const { handlePolls } = require("./features/polls");
const { handleBotEvents } = require("./features/botHandlers");
const { schedule } = require("node-schedule");
const cron = require("node-cron");
const { initRoulette } = require("./roulette");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const CHANNEL_CHAT_ID = process.env.CHANNEL_CHAT_ID || "YOUR_CHANNEL_CHAT_ID";

// Основные обработчики команд
handleWeatherCommand(bot);
handleNewsCommand(bot);
handlePhotoCommand(bot);
handleBratdnyaCommand(bot, CHANNEL_CHAT_ID);
handlePolls(bot, CHANNEL_CHAT_ID);
handleBotEvents(bot);
initRoulette(bot);

// Автоматические задачи
cron.schedule('0 0 * * *', resetBratDnya); // Сброс "брат дня" в полночь
cron.schedule('0 13 * * *', () => sendBratDnya(bot, CHANNEL_CHAT_ID)); // Выбор "брат дня" в 13:00
scheduleRandomPhotoCron(bot, CHANNEL_CHAT_ID); // Автофотки

// Пример: приветствие утром
cron.schedule("0 7 * * *", () => {
  bot.sendMessage(CHANNEL_CHAT_ID, "Здарова, Мужики");
});

// Пример: сообщение на ночь
cron.schedule("0 22 * * *", () => {
  bot.sendMessage(CHANNEL_CHAT_ID, "Спать пора, братишки. Давайте не заебывайте.");
});