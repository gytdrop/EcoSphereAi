const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal server error.' : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Helper to create structured errors
const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = errorHandler;
module.exports.createError = createError;
