require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");
const axios = require("axios");
const RSSParser = require("rss-parser");
const rssParser = new RSSParser();

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const phrases = [
  "Что ты вообще несёшь?",
  "Ты в своём уме?",
  "Мескаликом еще закрепил",
  "Что да да Минай",
  "Предлагаю Диману смачно пойти нахуй",
  "Че распизделись друганы",
  "Вы и щас красавчики братва",
  "Дай газу, братец",
  "После текилы голова говяжья",
  "Корректировку на пивко внесли",
  "Щас пиву дадим понедельник день тяжелый",
  'братик ну что ты?',
  "Андрей Минаев",
  "Египетская сила может тоже дать сегодня",
  "Секс",
  "Вери гуд",
  "Джабки особенной вырублю. Ебать ахуеем",
  "напротив замка пиво сидел пил в пятницу",
  "ОПА в пятницу тоже бухать пойду",
  "Да тяжко",
  "Не ну",
  "Пивасиком разравняться",
  "Батрачка",
  "На галере что ли?",
  "Хуй знает, братец",
  "Вай баля",
  "Вы что ахуели?",
  "НЕТ ВОЙНЕ",
  "Работайте братья",
  "Нашел бар в СПб где курить можно внутри",
  "браатик",
  "Чурка бля",
  "Опа нихуя",
  "Ну давай давай нападай",
  "Скиньте Славе тысячу на тинькофф",
  "Вася крутой чел",
  "Пошел димасик нахуй",
  "Долбаеб",
  "Может из тебя коклеты посыпятся борзенков",
  "Обедать будем",
  "Дирябчик",
];

let botId = null;

// Получаем ID бота после старта
bot.getMe().then((me) => {
  botId = me.id;
  console.log("Bot ID:", botId);
});

// Ответ на команды типа /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Привет, я Минбот! Я могу не только шутить, но и быть полезным. Вот что я умею:

/weather — покажу погоду в Москве и Мценске
/currency — расскажу курс рубля к доллару и юаню
/news — пришлю свежие новости

Также могу иногда прислать стикер или фразу для настроения!`
  );
});

// Ответ на любое текстовое сообщение
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  console.log(msg);

  // Игнорировать команды, кроме /start
  if (msg.text && msg.text.startsWith("/") && !msg.text.startsWith("/start"))
    return;

  // Реагируем на ответы на сообщения бота
  if (msg.reply_to_message && botId && msg.reply_to_message.from.id === botId) {
    const userText = msg.text || "";
    const answer = `братик что такое "${userText}"`;
    bot.sendMessage(chatId, answer, { reply_to_message_id: msg.message_id });
    return;
  }

  // С вероятностью 5% отвечаем
  if (Math.random() < 0.08) {
    // С вероятностью 20% отправляем стикер вместо текста
    if (Math.random() < 0.2) {
      const randomSticker =
        stickerIds[Math.floor(Math.random() * stickerIds.length)];
      bot.sendSticker(chatId, randomSticker);
    } else {
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      bot.sendMessage(chatId, randomPhrase);
    }
  }
});

bot.on("channel_post", (msg) => {
  const chatId = msg.chat.id;
  if (Math.random() < 0.034) {
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    bot.sendMessage(chatId, randomPhrase);
  }
});

// --- Погода ---
bot.onText(/\/weather/, async (msg) => {
  const chatId = msg.chat.id;
  const apiKey = process.env.OWM_API_KEY || "9a4c8c4dbacfadf76b6128331b053eaa";
  const cities = [
    { name: "Москва", query: "Moscow.ru" },
    { name: "Мценск", query: "Mtsensk.ru" },
  ];
  let reply = "";
  for (const city of cities) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.query}&appid=${apiKey}&units=metric&lang=ru`;
      const res = await axios.get(url);
      const w = res.data;
      reply += `🌤 <b>${city.name}</b>: ${w.weather[0].description}, ${w.main.temp}°C\n`;
    } catch (e) {
      if (e.response) {
        console.log("OpenWeatherMap error:", e.response.data);
        reply += `Ошибка: ${e.response.data.message} для ${city.name}\n`;
      } else {
        console.log("OpenWeatherMap error:", e);
        reply += `Не удалось получить погоду для ${city.name}\n`;
      }
    }
  }
  bot.sendMessage(chatId, reply, { parse_mode: "HTML" });
});

// --- Курс валют ---
bot.onText(/\/currency/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const res = await axios.get(
      "https://api.exchangerate.host/latest?base=RUB&symbols=USD,CNY"
    );
    const rates = res.data.rates;
    const usd = (1 / rates.USD).toFixed(2);
    const cny = (1 / rates.CNY).toFixed(2);
    const reply = `💵 1 USD = ${rates.USD.toFixed(
      2
    )} RUB\n💴 1 CNY = ${rates.CNY.toFixed(
      2
    )} RUB\n\n1 RUB = ${usd} USD\n1 RUB = ${cny} CNY`;
    bot.sendMessage(chatId, reply);
  } catch (e) {
    bot.sendMessage(chatId, "Не удалось получить курс валют.");
  }
});

// --- Новости ---
bot.onText(/\/news/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const feed = await rssParser.parseURL("https://meduza.io/rss2/all");
    const news = feed.items
      .slice(0, 5)
      .map((item) => `• <a href=\"${item.link}\">${item.title}</a>`)
      .join("\n");
    bot.sendMessage(chatId, `<b>Свежие новости Meduza:</b>\n${news}`, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  } catch (e) {
    bot.sendMessage(chatId, "Не удалось получить новости.");
  }
});

// --- Опросы ---
const pollQuestions = [
  {
    question: "Кто на галере сегодня?",
    options: ["Я на галере", "Я пиво пью", "Батрачка!", "А что за галера?"],
  },
  {
    question: "Кто по мескалику бы дал?",
    options: ["Я бы дал!", "Я пас", "Только пивко", "Что такое мескалик?"],
  },
  {
    question: "Пивко сегодня будет?",
    options: ["Будет", "Нет", "Я за рулём с часами", "Тяжко"],
  },
  {
    question: "Кто за пивко на галере?",
    options: ["Я за!", "Бутылочку бы водочки", "Только мескалик", "Ой тяжко братец"],
  },
  {
    question: "Мескалика бы ща?",
    options: ["Да!", "Нет", "Лучше пивка два а то и три", "я на галере брат"],
  },
];

const schedule = require('node-schedule');
let pollJobs = [];

function getRandomTimePair() {
  // Получить два случайных времени в пределах дня (например, между 10:00 и 23:00)
  function randomHour(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randomMinute() {
    return Math.floor(Math.random() * 60);
  }
  let firstHour = randomHour(10, 18);
  let secondHour = randomHour(19, 22);
  return [
    { hour: firstHour, minute: randomMinute() },
    { hour: secondHour, minute: randomMinute() },
  ];
}

function sendRandomPoll() {
  const poll = pollQuestions[Math.floor(Math.random() * pollQuestions.length)];
  bot.sendPoll(
    CHANNEL_CHAT_ID,
    poll.question,
    poll.options,
    { is_anonymous: false }
  );
}

function schedulePollsForToday() {
  // Удаляем старые задания
  pollJobs.forEach((job) => job.cancel());
  pollJobs = [];
  const times = getRandomTimePair();
  times.forEach((t) => {
    const job = schedule.scheduleJob({ hour: t.hour, minute: t.minute }, sendRandomPoll);
    pollJobs.push(job);
  });
}

// Каждый день в полночь пересоздаём задания на опросы
schedule.scheduleJob({ hour: 0, minute: 0 }, schedulePollsForToday);
// И сразу при запуске
schedulePollsForToday();

const CHANNEL_CHAT_ID = process.env.CHANNEL_CHAT_ID || "YOUR_CHANNEL_CHAT_ID";

// Каждый день в 8:00 утра по серверному времени
cron.schedule("0 8 * * *", () => {
  bot.sendMessage(CHANNEL_CHAT_ID, "Здарова, Мужики");
});

const periodicPhrases = [
  "Че притихли братульцы?",
  "Але амигосы",
  "Мучачес",
  "Мескалика бы ща",
];

// Каждые 20 минут
cron.schedule("*/37 * * * *", () => {
  const randomPhrase =
    periodicPhrases[Math.floor(Math.random() * periodicPhrases.length)];
  if (Math.random() < 0.4) {
    bot.sendMessage(CHANNEL_CHAT_ID, randomPhrase);
  }
});

// Каждый день в 22:00
cron.schedule("0 22 * * *", () => {
  bot.sendMessage(CHANNEL_CHAT_ID, "Спать пора мужики");
});

// file_id стикера для отправки
const stickerIds = [
  "CAACAgIAAx0CZ5pVEwABCxYGaHaf8E8XAAHKIvFhQAaxt6BK0J9OAAKCAAPHwsIgyP97roQJ6W42BA",
  "CAACAgIAAx0CZ5pVEwABCxYIaHagSuWH8X0JFUTyZRQdEjmmGbAAAlMAA8fCwiDYYvwqMZKy1zYE",
  "CAACAgIAAxkBAAN-aHafo8ofwR5wz0SPOncnioGzt4gAAv1RAALITHFKuuMcV_EejH82BA",
  "CAACAgIAAx0CZ5pVEwABCxYLaHagiRak11JEiKYlFPxd77IiOf4AAg0XAAKS9vBJ9xaUt_eoMbE2BA",
  "CAACAgQAAx0CZ5pVEwABCxYMaHagl0tlUTOYj1YnSyzLNHlRZH8AAlEPAAKm8XEedZ60Jhfak4Y2BA",
  "CAACAgIAAx0CZ5pVEwABCxYNaHagpPTPyZgWZv4Uv7k-NH3Jn_4AAgxzAAKCXilJn_2bl3zaByI2BA",
  "CAACAgIAAx0CZ5pVEwABCxYOaHags4PC08Oi6ymOgCpdxDIYLEMAAtU8AAIvL0BJuqeOrjC2PSM2BA",
  "CAACAgIAAx0CZ5pVEwABCxYPaHagvLy5H7GcvzBwhx4IaBspmrYAAn9OAAKA64FJMSMTsTA7pY82BA",
  "CAACAgIAAx0CZ5pVEwABCxc5aHdPZ0eSDV3IwFFj1rqLk4au8rAAApEAA4wS6xvXv4cXJyxP3jYE",
];
