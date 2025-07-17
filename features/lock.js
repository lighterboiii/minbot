const activeActions = new Map();

function isLocked(chatId) {
  return activeActions.get(chatId) === true;
}

function setLock(chatId) {
  activeActions.set(chatId, true);
}

function releaseLock(chatId) {
  activeActions.delete(chatId);
}

function withLock(handler) {
  return async function (msg, ...args) {
    const chatId = msg.chat.id;
    if (isLocked(chatId)) return;
    setLock(chatId);
    try {
      await handler(msg, ...args);
    } finally {
      releaseLock(chatId);
    }
  };
}

module.exports = { isLocked, setLock, releaseLock, withLock }; 