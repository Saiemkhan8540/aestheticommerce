class AppError extends Error {
  constructor(message, statusCode, payload = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; 
    this.payload = payload;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;