require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

// Вставь сюда свой токен от BotFather
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const phrases = [
  'Что ты вообще несёшь?',
  'Ты в своём уме?',
  'Мескаликом еще закрепил',
  'Дай газу, братец',
  'После текилы голова говяжья',
  'Да тяжко',
  'Не ну',
  'Пивасиком разравняться',
  'Батрачка',
  'На галере что ли?',
  'Хуй знает, братец',
  'Вай баля',
  'Вы что ахуели?',
  'НЕТ ВОЙНЕ',
  'Работайте братья',
  'Нашел бар в СПб где курить можно внутри',
  'браатик',
  'Чурка бля',
  'Опа нихуя',
  'Ну давай давай нападай',
  'Скиньте Славе тысячу на тинькофф',
  'Вася крутой чел',
  'Пошел димасик нахуй',
  'Долбаеб',
  'Может из тебя коклеты посыпятся борзенков',
  'Обедать будем'
];


// Ответ на команды типа /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет, я Минчик!');
});

// Ответ на любое текстовое сообщение
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(msg);

  // Игнорировать команды, кроме /start
  if (msg.text.startsWith('/')) return;

  if (Math.random() < 0.05) {
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    // С вероятностью 50% ответить прямо на сообщение, иначе просто отправить в чат
    if (Math.random() < 0.5) {
      bot.sendMessage(chatId, randomPhrase, { reply_to_message_id: msg.message_id });
    } else {
      bot.sendMessage(chatId, randomPhrase);
    }
  }
});

bot.on('channel_post', (msg) => {
  const chatId = msg.chat.id;
  if (Math.random() < 0.034) {
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    bot.sendMessage(chatId, randomPhrase);
  }
});

const CHANNEL_CHAT_ID = process.env.CHANNEL_CHAT_ID || 'YOUR_CHANNEL_CHAT_ID';

// Каждый день в 8:00 утра по серверному времени
cron.schedule('0 8 * * *', () => {
  bot.sendMessage(CHANNEL_CHAT_ID, 'Здарова, Мужики');
});