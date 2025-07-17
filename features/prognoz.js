// const axios = require("axios");
const HOROSCOPE_PHRASES = require("../data/horoscopeFrases");

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];


function getRandomSign() {
  return ZODIAC_SIGNS[Math.floor(Math.random() * ZODIAC_SIGNS.length)];
}

// async function translateToRussian(text) {
//   try {
//     const res = await axios.post('https://libretranslate.de/translate', {
//       q: text,
//       source: 'en',
//       target: 'ru',
//       format: 'text'
//     }, {
//       headers: { 'accept': 'application/json' }
//     });
//     return res.data.translatedText;
//   } catch {
//     return null;
//   }
// }

function handlePrognozCommand(bot) {
  bot.onText(/\/prognoz(?:\s+(\S+))?/, async (msg, match) => {
    const user = msg.from;
    const mention = user.username ? `@${user.username}` : user.first_name || 'братец';
    // let sign = match[1] ? match[1].toLowerCase() : getRandomSign();
    // // Приводим к английским названиям знаков
    // const signMap = {
    //   "овен": "aries", "телец": "taurus", "близнецы": "gemini", "рак": "cancer",
    //   "лев": "leo", "дева": "virgo", "весы": "libra", "скорпион": "scorpio",
    //   "стрелец": "sagittarius", "козерог": "capricorn", "водолей": "aquarius", "рыбы": "pisces"
    // };
    // if (signMap[sign]) sign = signMap[sign];
    // if (!ZODIAC_SIGNS.includes(sign)) sign = getRandomSign();
    // try {
    //   const res = await axios.get(`https://ohmanda.com/api/horoscope/${sign}/`);
    //   const text = res.data && res.data.horoscope ? res.data.horoscope : null;
    //   if (text) {
    //     let translated = await translateToRussian(text);
    //     if (translated) {
    //       bot.sendMessage(msg.chat.id, `${mention}, твой гороскоп на сегодня, братик: ${translated}`);
    //     } else {
    //       bot.sendMessage(msg.chat.id, `${mention}, твой гороскоп на сегодня, братец: ${text}`);
    //     }
    //   } else {
    //     throw new Error('no horoscope');
    //   }
    // } catch (e) {
      const phrase = HOROSCOPE_PHRASES[Math.floor(Math.random() * HOROSCOPE_PHRASES.length)];
      bot.sendMessage(msg.chat.id, `${mention}, братец, слушай: ${phrase}`);
    // }
  });
}

module.exports = { handlePrognozCommand }; 