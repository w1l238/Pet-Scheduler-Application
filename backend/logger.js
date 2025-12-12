const getTimestamp = () => new Date().toISOString();

/**
 * Logs a message with a standard format.
 * @param {string} level - The log level (e.g., 'info', 'error').
 * @param {string} category - The category of the log (e.g., 'API', 'DB').
 * @param {string} message - The log message.
 * @param  {...any} args - Additional arguments to log.
 */
const log = (level, category, message, ...args) => {
  const formattedMessage = `[${getTimestamp()}] [${level.toUpperCase()}] [${category}] ${message}`;
  
  if (level === 'error') {
    console.error(formattedMessage, ...args);
  } else {
    console.log(formattedMessage, ...args);
  }
};

const logger = {
  info: (category, message, ...args) => log('info', category, message, ...args),
  warn: (category, message, ...args) => log('warn', category, message, ...args),
  error: (category, message, ...args) => log('error', category, message, ...args),
  debug: (category, message, ...args) => {
    // Only log debug messages if in development mode
    if (process.env.NODE_ENV === 'development') {
      log('debug', category, message, ...args);
    }
  },
};

module.exports = logger;
