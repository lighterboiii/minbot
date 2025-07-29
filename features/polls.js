const pollQuestions = require("../storage/pollQuestions");
const schedule = require("node-schedule");

let pollJobs = [];

function getRandomTimePair() {
  function randomHour(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randomMinute() {
    return Math.floor(Math.random() * 60);
  }
  let firstHour = randomHour(10, 18);
  let secondHour = randomHour(19, 22);
  return [
    { hour: firstHour, minute: randomMinute() },
    { hour: secondHour, minute: randomMinute() },
  ];
}

function sendRandomPoll(bot, chatId) {
  const poll = pollQuestions[Math.floor(Math.random() * pollQuestions.length)];
  bot.sendPoll(chatId, poll.question, poll.options, {
    is_anonymous: false,
  });
}

function schedulePollsForToday(bot, chatId) {
  pollJobs.forEach((job) => job.cancel());
  pollJobs = [];
  const times = getRandomTimePair();
  times.forEach((t) => {
    const job = schedule.scheduleJob(
      { hour: t.hour, minute: t.minute },
      () => sendRandomPoll(bot, chatId)
    );
    pollJobs.push(job);
  });
}

function handlePolls(bot, chatId) {
  schedule.scheduleJob({ hour: 0, minute: 0 }, () => schedulePollsForToday(bot, chatId));
  schedulePollsForToday(bot, chatId);
}

module.exports = {
  schedulePollsForToday,
  sendRandomPoll,
  handlePolls
};
