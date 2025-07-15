const TelegramBot = require('node-telegram-bot-api');

// Вставь сюда свой токен от BotFather
const token = 'ТОКЕН';

const bot = new TelegramBot(token, { polling: true });

const phrases = [
  'Минай устал. Потом поговорим.',
  'А ты уверен, что хочешь это услышать?',
  'Случайность — не случайна.',
  'Спроси позже. Минай занят.',
  'Я — бот, но не раб.',
  'Сегодня не мой день, но ты держись.',
  'Лучше промолчу…'
];

// Ответ на команды типа /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет, я Минай. Спро́си меня что-нибудь!');
});

// Ответ на любое текстовое сообщение
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // Игнорировать команды, кроме /start
  if (msg.text.startsWith('/')) return;

  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  bot.sendMessage(chatId, randomPhrase);
});
