require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Вставь сюда свой токен от BotFather
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const phrases = [
  'Что ты вообще несёшь?',
  'Ты в своём уме?',
  'Мескаликом еще закрепил',
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
  bot.sendMessage(msg.chat.id, 'Привет, я Минбот. Спро́си меня что-нибудь!');
});

// Ответ на любое текстовое сообщение
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // Игнорировать команды, кроме /start
  if (msg.text.startsWith('/')) return;

  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  bot.sendMessage(chatId, randomPhrase);
});

bot.on('channel_post', (msg) => {
  const chatId = msg.chat.id;
  // С вероятностью 30% отправляем сообщение
  if (Math.random() < 0.034) {
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    bot.sendMessage(chatId, randomPhrase);
  }
});