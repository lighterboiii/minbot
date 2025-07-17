const fs = require("fs");
const GIFS_FILE = "storage/gifs.json";

function saveGifId(fileId) {
  let arr = [];
  if (fs.existsSync(GIFS_FILE)) {
    try {
      arr = JSON.parse(fs.readFileSync(GIFS_FILE, "utf8"));
    } catch {}
  }
  if (!arr.includes(fileId)) {
    arr.push(fileId);
    fs.writeFileSync(GIFS_FILE, JSON.stringify(arr));
  }
}

function getRandomGifId() {
  if (!fs.existsSync(GIFS_FILE)) return null;
  let arr = [];
  try {
    arr = JSON.parse(fs.readFileSync(GIFS_FILE, "utf8"));
  } catch {}
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function handleGifReaction(bot) {
  bot.on("message", (msg) => {
    if (msg.text && Math.random() < 0.03) {
      const gifId = getRandomGifId();
      if (gifId) {
        bot.sendAnimation(msg.chat.id, gifId, {
          reply_to_message_id: msg.message_id,
        });
      }
    }
  });
}

module.exports = {
  saveGifId,
  getRandomGifId,
  handleGifReaction,
};
