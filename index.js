require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");
const axios = require("axios");
const RSSParser = require("rss-parser");
const rssParser = new RSSParser();
const fs = require("fs");
const PHOTOS_FILE = "photos.json";
const USERS_OF_DAY_FILE = "usersOfDay.json";
const insultsOfDay = require("./insultsOfDay");
const BRATDNYA_FILE = 'bratdnya.json';

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const phrases = require("./phrases");
const photoCaptions = require("./photoCaptions");
const pollQuestions = require("./pollQuestions");
const stickerIds = require("./stickerIds");
const periodicPhrases = require("./periodicPhrases");
const emojis = require("./emojis");
const insults = require("./insults");

const SLAVA_ID = 653015244;
const slavaTriggers = [
  "слава",
  "славик",
  "Слава",
  "Славой",
  "Славу",
  "Славе",
  "О славе",
  "славой",
];

let botId = null;
let botUsername = null;

// Получаем ID и username бота после старта
bot.getMe().then((me) => {
  botId = me.id;
  botUsername = me.username;
  console.log("Bot ID:", botId);
  console.log("Bot username:", botUsername);
});

// Ответ на команды типа /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Привет, я Минбот! Я могу не только шутить, но и быть полезным. Вот что я умею:

/weather — покажу погоду
/news — пришлю подборку свежих новостей

/photo — пришлю случайную фотку из чата
/bratdnya — выберу "брата дня"
/check_pivko — выберу, кто угощает пивком
/check_mescal — выберу, кто угощает мескаликом
/photo – отправлю фотку из чата с комментарием

Также я иногда сам пишу в чат, отправляю фотки, новости, создаю опросы и эмодзи!`
  );
});

// Ответ на любое текстовое сообщение
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const lowerCaseText = (msg.text || "").toLowerCase();

  // Реакция на Славу
  if (
    msg.from.id === SLAVA_ID &&
    slavaTriggers.some((trigger) => lowerCaseText.includes(trigger))
  ) {
    const randomInsult = insults[Math.floor(Math.random() * insults.length)];
    bot.sendMessage(chatId, randomInsult, {
      reply_to_message_id: msg.message_id,
    });
    return;
  }

  // Сохраняем file_id самой большой фотки
  if (msg.photo && Array.isArray(msg.photo) && msg.photo.length > 0) {
    const largest = msg.photo[msg.photo.length - 1];
    savePhotoId(largest.file_id);
  }

  // Реакция на упоминание бота через @username (дополнительно, не return)
  if (
    msg.text &&
    botUsername &&
    msg.text.toLowerCase().includes("@" + botUsername.toLowerCase())
  ) {
    let userText = msg.text
      .replace(new RegExp("@" + botUsername, "ig"), "")
      .trim();
    const answer = `Сам ты ${userText} братик
    
Я вот что могу:

/weather — покажу погоду
/news — пришлю подборку свежих новостей
/photo — пришлю случайную фотку из чата и че нить скажу
/bratdnya — выберу "брата дня"
/pivko — выберу, кто угощает пивком
/mezcal — выберу, кто угощает мескаликом
/photo – отправлю фотку из чата с комментарием`;
    bot.sendMessage(chatId, answer, { reply_to_message_id: msg.message_id });
  }

  // Игнорировать команды, кроме /start
  if (msg.text && msg.text.startsWith("/") && !msg.text.startsWith("/start"))
    return;

  // Реагируем на ответы на сообщения бота
  if (msg.reply_to_message && botId && msg.reply_to_message.from.id === botId) {
    if (msg.text) {
      const userText = msg.text;
      const answer = `Братик ${userText} не знаю. Может лучше разравняемся?`;
      bot.sendMessage(chatId, answer, { reply_to_message_id: msg.message_id });
    } else if (msg.sticker) {
      const answer = `Братик, ты мне стикер отправил? Может лучше деньги Славе скинешь на пивко?`;
      bot.sendMessage(chatId, answer, { reply_to_message_id: msg.message_id });
    }
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

  if (Math.random() < 0.02) {
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    bot.sendMessage(msg.chat.id, randomEmoji, {
      reply_to_message_id: msg.message_id,
    });
  }
  if (msg.from && msg.from.id) {
    saveUserOfDay(msg.from);
  }
});
// --- Погода ---
bot.onText(/\/weather/, async (msg) => {
  const chatId = msg.chat.id;
  const apiKey = process.env.OWM_API_KEY || "";
  const cities = [
    { name: "Москва", query: "Moscow" },
    { name: "Мценск", query: "Mtsensk" },
    { name: "Санкт-Петербург", query: "Saint Petersburg" },
  ];
  let reply = "";
  for (const city of cities) {
    try {
      const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city.query}&lang=ru`;
      const res = await axios.get(url);
      const w = res.data;
      reply += `🌤 <b>${city.name}</b>: ${w.current.condition.text}, ${w.current.temp_c}°C\n`;
    } catch (e) {
      if (e.response && e.response.data && e.response.data.error) {
        reply += `Ошибка: ${e.response.data.error.message} для ${city.name}\n`;
      } else {
        reply += `Не удалось получить погоду для ${city.name}\n`;
      }
    }
  }
  bot.sendMessage(chatId, reply, { parse_mode: "HTML" });
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
    bot.sendMessage(
      chatId,
      `<b>Свежие новости для вас, братики:</b>\n${news}`,
      {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }
    );
  } catch (e) {
    bot.sendMessage(chatId, "Не удалось получить новости.");
  }
});
// --- Опросы ---
const schedule = require("node-schedule");
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
  bot.sendPoll(CHANNEL_CHAT_ID, poll.question, poll.options, {
    is_anonymous: false,
  });
}

function schedulePollsForToday() {
  // Удаляем старые задания
  pollJobs.forEach((job) => job.cancel());
  pollJobs = [];
  const times = getRandomTimePair();
  times.forEach((t) => {
    const job = schedule.scheduleJob(
      { hour: t.hour, minute: t.minute },
      sendRandomPoll
    );
    pollJobs.push(job);
  });
}

// Каждый день в полночь пересоздаём задания на опросы
schedule.scheduleJob({ hour: 0, minute: 0 }, schedulePollsForToday);
// И сразу при запуске
schedulePollsForToday();

const CHANNEL_CHAT_ID = process.env.CHANNEL_CHAT_ID || "YOUR_CHANNEL_CHAT_ID";

// Каждый день в 8:00 утра по серверному времени
cron.schedule("0 7 * * *", async () => {
  bot.sendMessage(CHANNEL_CHAT_ID, "Здарова, Мужики");
  // Погода утром
  const apiKey = process.env.OWM_API_KEY || "";
  const cities = [
    { name: "Москва", query: "Moscow" },
    { name: "Мценск", query: "Mtsensk" },
    { name: "Санкт-Петербург", query: "Saint Petersburg" },
  ];
  let reply = "Погодка нынче такая у нас";
  for (const city of cities) {
    try {
      const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city.query}&lang=ru`;
      const res = await axios.get(url);
      const w = res.data;
      reply += `🌤 <b>${city.name}</b>: ${w.current.condition.text}, ${w.current.temp_c}°C\n`;
    } catch (e) {
      if (e.response && e.response.data && e.response.data.error) {
        reply += `Ошибка: ${e.response.data.error.message} для ${city.name}\n`;
      } else {
        reply += `Не удалось получить погоду для ${city.name}\n`;
      }
    }
  }
  bot.sendMessage(CHANNEL_CHAT_ID, reply, { parse_mode: "HTML" });
});

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

const sendRandomNews = async () => {
  try {
    const feed = await rssParser.parseURL("https://meduza.io/rss2/all");
    const items = feed.items;
    if (!items || items.length === 0) return;
    const randomItem = items[Math.floor(Math.random() * items.length)];
    const news = `• <a href=\"${randomItem.link}\">${randomItem.title}</a>`;
    bot.sendMessage(CHANNEL_CHAT_ID, `<b>Почитайте, братцы:</b>\n${news}`, {
      parse_mode: "HTML",
      disable_web_page_preview: false,
    });
  } catch (e) {
    // Не отправляем ничего, если не удалось
  }
};

function scheduleRandomNewsCron() {
  // Снимаем старый, если есть
  if (global.newsCronJob) global.newsCronJob.stop();
  // Случайный интервал 2-3 часа
  const minutes = Math.floor(Math.random() * 60) + 120; // 120-179 минут
  global.newsCronJob = cron.schedule(`*/${minutes} * * * *`, async () => {
    await sendRandomNews();
    scheduleRandomNewsCron();
  });
}

scheduleRandomNewsCron();

function savePhotoId(fileId) {
  let arr = [];
  if (fs.existsSync(PHOTOS_FILE)) {
    try {
      arr = JSON.parse(fs.readFileSync(PHOTOS_FILE, "utf8"));
    } catch {}
  }
  if (!arr.includes(fileId)) {
    arr.push(fileId);
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify(arr));
  }
}

function sendRandomPhoto() {
  if (!fs.existsSync(PHOTOS_FILE)) return;
  let arr = [];
  try {
    arr = JSON.parse(fs.readFileSync(PHOTOS_FILE, "utf8"));
  } catch {}
  if (!arr.length) return;
  const fileId = arr[Math.floor(Math.random() * arr.length)];
  const caption =
    photoCaptions[Math.floor(Math.random() * photoCaptions.length)];
  bot.sendPhoto(CHANNEL_CHAT_ID, fileId, { caption });
}

function scheduleRandomPhotoCron() {
  if (global.photoCronJob) global.photoCronJob.stop();
  const minutes = Math.floor(Math.random() * 60) + 480 / 3; // 160-219 минут (2-3 раза в день)
  global.photoCronJob = cron.schedule(
    `*/${Math.floor(minutes)} * * * *`,
    () => {
      sendRandomPhoto();
      scheduleRandomPhotoCron();
    }
  );
}
scheduleRandomPhotoCron();

bot.onText(/\/photo/, (msg) => {
  if (!fs.existsSync(PHOTOS_FILE)) return;
  let arr = [];
  try {
    arr = JSON.parse(fs.readFileSync(PHOTOS_FILE, "utf8"));
  } catch {}
  if (!arr.length) return;
  const fileId = arr[Math.floor(Math.random() * arr.length)];
  const caption =
    photoCaptions[Math.floor(Math.random() * photoCaptions.length)];
  bot.sendPhoto(msg.chat.id, fileId, { caption });
});

function saveUserOfDay(user) {
  let arr = [];
  if (fs.existsSync(USERS_OF_DAY_FILE)) {
    try {
      arr = JSON.parse(fs.readFileSync(USERS_OF_DAY_FILE, "utf8"));
    } catch {}
  }
  if (!arr.some((u) => u.id === user.id)) {
    arr.push({
      id: user.id,
      username: user.username || "",
      first_name: user.first_name || "",
    });
    fs.writeFileSync(USERS_OF_DAY_FILE, JSON.stringify(arr));
  }
}

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

function sendBratDnya(forceNew = false) {
  const today = getTodayStr();
  let brat = loadBratDnya();
  if (brat && brat.date === today && !forceNew) {
    // Новый оскорбительный текст, но тот же пользователь
    const insult = insultsOfDay[Math.floor(Math.random() * insultsOfDay.length)];
    const mention = brat.user.username ? `@${brat.user.username}` : brat.user.first_name || 'братец';
    const text = `Братик дня уже выбран, сегодня ${insult} дня — ${mention}`;
    bot.sendMessage(CHANNEL_CHAT_ID, text);
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
  bot.sendMessage(CHANNEL_CHAT_ID, text);
}

cron.schedule('0 0 * * *', resetBratDnya);
cron.schedule('0 13 * * *', () => sendBratDnya());
bot.onText(/\/bratdnya/, (msg) => {
  sendBratDnya();
});

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
  const text = `Чек на пивко сегодня за ${mention}, сегодня твоя очередь угощать!`;
  bot.sendMessage(msg.chat.id, text);
});

bot.onText(/\/mescal/, (msg) => {
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
  const text = `Чек на мескалик сегодня за ${mention}, сегодня твоя очередь угощать!`;
  bot.sendMessage(msg.chat.id, text);
});
