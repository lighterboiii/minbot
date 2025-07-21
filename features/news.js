const RSSParser = require("rss-parser");
const rssParser = new RSSParser();

function handleNewsCommand(bot) {
  const botStartTime = Math.floor(Date.now() / 1000);
  bot.onText(/\/news/, async (msg) => {
    if (msg.date < botStartTime - 10) return;
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
      bot.sendMessage(chatId, "че то новостей нет никаких, братцы");
    }
  });
}

module.exports = { handleNewsCommand };
