const fs = require("fs");
const photoCaptions = require("../data/photoCaptions");
const PHOTOS_FILE = "photos.json";

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

function canSendAuto(type) {
  const now = Date.now();
  if (
    global.lastAutoType &&
    global.lastAutoType !== type &&
    global.lastAutoTime &&
    now - global.lastAutoTime < 5 * 60 * 1000 // 5 минут
  ) {
    return false;
  }
  global.lastAutoType = type;
  global.lastAutoTime = now;
  return true;
}

function sendRandomPhoto(bot, chatId) {
  if (!canSendAuto('photo')) return;
  if (!fs.existsSync(PHOTOS_FILE)) return;
  let arr = [];
  try {
    arr = JSON.parse(fs.readFileSync(PHOTOS_FILE, "utf8"));
  } catch {}
  if (!arr.length) return;
  const fileId = arr[Math.floor(Math.random() * arr.length)];
  const caption =
    photoCaptions[Math.floor(Math.random() * photoCaptions.length)];
  bot.sendPhoto(chatId, fileId, { caption });
}

function handlePhotoCommand(bot) {
  bot.onText(/\/photo/, (msg) => {
    sendRandomPhoto(bot, msg.chat.id);
  });
}

function scheduleRandomPhotoCron(bot, chatId) {
  const cron = require("node-cron");
  if (global.photoCronJob) global.photoCronJob.stop();
  const minutes = Math.floor(Math.random() * 60) + 480 / 3;
  global.photoCronJob = cron.schedule(
    `*/${Math.floor(minutes)} * * * *`,
    () => {
      sendRandomPhoto(bot, chatId);
      scheduleRandomPhotoCron(bot, chatId);
    }
  );
}

module.exports = {
  handlePhotoCommand,
  sendRandomPhoto,
  savePhotoId,
  scheduleRandomPhotoCron,
  canSendAuto
};
