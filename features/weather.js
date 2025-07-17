const axios = require("axios");
const { withLock } = require("./lock");

function handleWeatherCommand(bot) {
  bot.onText(/\/weather/, withLock(async (msg) => {
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
  }));
}

module.exports = { handleWeatherCommand };
