const HOROSCOPE_PHRASES = require("../storage/horoscopeFrases");

function handlePrognozCommand(bot) {
  const botStartTime = Math.floor(Date.now() / 1000);
  bot.onText(/\/prognoz(?:\s+(\S+))?/, async (msg, match) => {
    if (msg.date < botStartTime - 10) return;
    const user = msg.from;
    const mention = user.username ? `@${user.username}` : user.first_name || 'братец';
      const phrase = HOROSCOPE_PHRASES[Math.floor(Math.random() * HOROSCOPE_PHRASES.length)];
      bot.sendMessage(msg.chat.id, `${mention}, ${phrase}`);
  });
}

module.exports = { handlePrognozCommand }; 