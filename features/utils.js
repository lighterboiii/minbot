const fs = require("fs");

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

function getTodayStr() {
  const now = new Date();
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

function loadJson(file) {
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data));
}

function saveUserOfDay(user, file = "usersOfDay.json") {
  let arr = loadJson(file);
  if (!arr.some((u) => u.id === user.id)) {
    arr.push({
      id: user.id,
      username: user.username || "",
      first_name: user.first_name || "",
    });
    saveJson(file, arr);
  }
}

module.exports = {
  canSendAuto,
  getTodayStr,
  loadJson,
  saveJson,
  saveUserOfDay
};
