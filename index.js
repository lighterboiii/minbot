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
  'Что да да Минай',
  'Предлагаю Диману смачно пойти нахуй',
  'Че распизделись друганы',
  'Вы и щас красавчики братва',
  'Дай газу, братец',
  'После текилы голова говяжья',
  'Корректировку на пивко внесли',
  'Щас пиву дадим понедельник день тяжелый',
  'Андрей Минаев',
 'Египетская сила может тоже дать сегодня',
 'Секс',
 'Вери гуд',
 'Джабки особенной вырублю. Ебать ахуеем',
 'напротив замка пиво сидел пил в пятницу',
 'ОПА в пятницу тоже бухать пойду',
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
  'Обедать будем',
  'Дирябчик',
];

let botId = null;

// Получаем ID бота после старта
bot.getMe().then(me => {
  botId = me.id;
  console.log('Bot ID:', botId);
});

// Ответ на команды типа /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет, я Минчик!');
});

// Ответ на любое текстовое сообщение
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(msg);

  // Игнорировать команды, кроме /start
  if (msg.text && msg.text.startsWith('/') && !msg.text.startsWith('/start')) return;

  // Реагируем на ответы на сообщения бота
  if (msg.reply_to_message && botId && msg.reply_to_message.from.id === botId) {
    const userText = msg.text || '';
    const answer = `братик что такое "${userText}"`;
    bot.sendMessage(chatId, answer, { reply_to_message_id: msg.message_id });
    return;
  }
  

  // С вероятностью 5% отвечаем
  if (Math.random() < 0.08) {
    // С вероятностью 20% отправляем стикер вместо текста
    if (Math.random() < 0.2) {
      const randomSticker = stickerIds[Math.floor(Math.random() * stickerIds.length)];
      bot.sendSticker(chatId, randomSticker);
    } else {
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
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

const periodicPhrases = [
  'Че притихли братульцы?',
  'Але амигосы',
  'Мучачес',
  'Мескалика бы ща'
];

// Каждые 20 минут
cron.schedule('*/20 * * * *', () => {
  const randomPhrase = periodicPhrases[Math.floor(Math.random() * periodicPhrases.length)];
  bot.sendMessage(CHANNEL_CHAT_ID, randomPhrase);
});

// Каждый день в 22:00
cron.schedule('0 22 * * *', () => {
  bot.sendMessage(CHANNEL_CHAT_ID, 'Спать пора мужики');
});

// file_id стикера для отправки
const stickerIds = [
  'CAACAgIAAx0CZ5pVEwABCxYGaHaf8E8XAAHKIvFhQAaxt6BK0J9OAAKCAAPHwsIgyP97roQJ6W42BA',
  'CAACAgIAAx0CZ5pVEwABCxYIaHagSuWH8X0JFUTyZRQdEjmmGbAAAlMAA8fCwiDYYvwqMZKy1zYE',
  'CAACAgIAAxkBAAN-aHafo8ofwR5wz0SPOncnioGzt4gAAv1RAALITHFKuuMcV_EejH82BA',
  'CAACAgIAAx0CZ5pVEwABCxYLaHagiRak11JEiKYlFPxd77IiOf4AAg0XAAKS9vBJ9xaUt_eoMbE2BA',
  'CAACAgQAAx0CZ5pVEwABCxYMaHagl0tlUTOYj1YnSyzLNHlRZH8AAlEPAAKm8XEedZ60Jhfak4Y2BA',
  'CAACAgIAAx0CZ5pVEwABCxYNaHagpPTPyZgWZv4Uv7k-NH3Jn_4AAgxzAAKCXilJn_2bl3zaByI2BA',
  'CAACAgIAAx0CZ5pVEwABCxYOaHags4PC08Oi6ymOgCpdxDIYLEMAAtU8AAIvL0BJuqeOrjC2PSM2BA',
  'CAACAgIAAx0CZ5pVEwABCxYPaHagvLy5H7GcvzBwhx4IaBspmrYAAn9OAAKA64FJMSMTsTA7pY82BA'
];
