const axios = require("axios");

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const HOROSCOPE_PHRASES = [
  "Сегодня отличный день, чтобы разравняться с братвой и выпить пивка!",
  "Твой пенис сегодня встанет на путь успеха. Не забудь поделиться этим с друзьями!",
  "Возможно, сегодня ты узнаешь, кто настоящий братец.",
  "Пей воду, не забывай про пиво и не грусти — сегодня всё получится!",
  "Сегодня твой день: мескалик на стороне тех, кто не ноет.",
  "Порадуй себя чем-нибудь вкусным и не забывай про мемы.",
  "Если что-то не получается — просто попробуй ещё раз. Или выпей пивка.",
  "Сегодня твой пенис особенно харизматичен. Осторожно с этим!",
  "Братва оценит твои старания. Главное — не забывай про юмор.",
  "Вечером возможен неожиданный успех. Или неожиданный пивко.",
  "Не слушай Димана — слушай своё сердце!",
  "Сегодня можно всё. Но лучше не всё.",
  "Порадуй братишек добрым словом и хорошим настроением!",
  "Если кто-то бесит — просто пошли его нахуй. Гороскоп разрешает!",
  "Твой пенис сегодня в ударе. Не подведи его!"
];

function getRandomSign() {
  return ZODIAC_SIGNS[Math.floor(Math.random() * ZODIAC_SIGNS.length)];
}

async function translateToRussian(text) {
  try {
    const res = await axios.post('https://libretranslate.de/translate', {
      q: text,
      source: 'en',
      target: 'ru',
      format: 'text'
    }, {
      headers: { 'accept': 'application/json' }
    });
    return res.data.translatedText;
  } catch {
    return null;
  }
}

function handlePrognozCommand(bot) {
  bot.onText(/\/prognoz(?:\s+(\S+))?/, async (msg, match) => {
    const user = msg.from;
    const mention = user.username ? `@${user.username}` : user.first_name || 'братец';
    let sign = match[1] ? match[1].toLowerCase() : getRandomSign();
    // Приводим к английским названиям знаков
    const signMap = {
      "овен": "aries", "телец": "taurus", "близнецы": "gemini", "рак": "cancer",
      "лев": "leo", "дева": "virgo", "весы": "libra", "скорпион": "scorpio",
      "стрелец": "sagittarius", "козерог": "capricorn", "водолей": "aquarius", "рыбы": "pisces"
    };
    if (signMap[sign]) sign = signMap[sign];
    if (!ZODIAC_SIGNS.includes(sign)) sign = getRandomSign();
    try {
      const res = await axios.get(`https://ohmanda.com/api/horoscope/${sign}/`);
      const text = res.data && res.data.horoscope ? res.data.horoscope : null;
      if (text) {
        let translated = await translateToRussian(text);
        if (translated) {
          bot.sendMessage(msg.chat.id, `${mention}, твой гороскоп на сегодня (${sign}): ${translated}`);
        } else {
          bot.sendMessage(msg.chat.id, `${mention}, твой гороскоп на сегодня (${sign}): ${text}`);
        }
      } else {
        throw new Error('no horoscope');
      }
    } catch (e) {
      const phrase = HOROSCOPE_PHRASES[Math.floor(Math.random() * HOROSCOPE_PHRASES.length)];
      bot.sendMessage(msg.chat.id, `${mention}, твой шуточный прогноз: ${phrase}`);
    }
  });
}

module.exports = { handlePrognozCommand }; 