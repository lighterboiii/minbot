const fs = require("fs");
const path = require("path");
const STICKERS_FILE = path.resolve(__dirname, "../data/stickerIds.js");
let stickerIds = require("../data/stickerIds");

function saveStickerId(fileId) {
  if (!Array.isArray(stickerIds)) stickerIds = [];
  if (!stickerIds.includes(fileId)) {
    stickerIds.push(fileId);
    // Обновляем файл data/stickerIds.js
    const content = `module.exports = ${JSON.stringify(stickerIds, null, 2)};\n`;
    fs.writeFileSync(STICKERS_FILE, content, "utf8");
  }
}

function getRandomStickerId() {
  if (!Array.isArray(stickerIds) || !stickerIds.length) return null;
  return stickerIds[Math.floor(Math.random() * stickerIds.length)];
}

function handleStickerReaction(bot) {
  bot.on('message', (msg) => {
    // Автоматически сохраняем новые стикеры
    if (msg.sticker && msg.sticker.file_id) {
      saveStickerId(msg.sticker.file_id);
    }
    // Реакция на сообщение с вероятностью 8%
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
