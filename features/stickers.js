const fs = require("fs");
const stickerIds = require("../stickerIds");
const STICKERS_FILE = "stickerIds.js";

function saveStickerId(fileId) {
  // Можно хранить в stickerIds.js или отдельном json, пример для json:
  let arr = [];
  if (fs.existsSync(STICKERS_FILE)) {
    try { arr = JSON.parse(fs.readFileSync(STICKERS_FILE, 'utf8')); } catch {}
  }
  if (!arr.includes(fileId)) {
    arr.push(fileId);
    fs.writeFileSync(STICKERS_FILE, JSON.stringify(arr));
  }
  // Для текущей реализации просто пушим в массив (если нужно — доработать под json)
}

function getRandomStickerId() {
  if (!Array.isArray(stickerIds) || !stickerIds.length) return null;
  return stickerIds[Math.floor(Math.random() * stickerIds.length)];
}

function handleStickerReaction(bot) {
  // Реакция на сообщение с вероятностью 8%
  bot.on('message', (msg) => {
    if (msg.text && Math.random() < 0.08) {
      const stickerId = getRandomStickerId();
      if (stickerId) {
        bot.sendSticker(msg.chat.id, stickerId);
      }
    }
  });
}

module.exports = {
  saveStickerId,
  getRandomStickerId,
  handleStickerReaction
};
