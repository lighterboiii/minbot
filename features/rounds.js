const fs = require('fs');
const path = require('path');
const ROUNDS_FILE = path.join(__dirname, '../storage/rounds.json');

function saveRound(fileId) {
  let arr = [];
  if (fs.existsSync(ROUNDS_FILE)) {
    try {
      arr = JSON.parse(fs.readFileSync(ROUNDS_FILE, 'utf8'));
    } catch {}
  }
  if (!arr.includes(fileId)) {
    arr.push(fileId);
    fs.writeFileSync(ROUNDS_FILE, JSON.stringify(arr, null, 2));
  }
}

function getRandomRoundId() {
  if (!fs.existsSync(ROUNDS_FILE)) return null;
  let arr = [];
  try {
    arr = JSON.parse(fs.readFileSync(ROUNDS_FILE, 'utf8'));
  } catch {}
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  saveRound,
  getRandomRoundId
}; 