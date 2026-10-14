const AppError = require('../utils/AppError');

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendProdError = (err, res) => {
  // created via apperror
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } 

  else {
    // not created using apperror
    console.error('ERROR:', err);

    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};


const handleCastErrorDB = err => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.keyValue ? JSON.stringify(err.keyValue) : 'Duplicate value';
  return new AppError(`Duplicate field value: ${value}. Please use another value.`, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again.', 401);

const handleJWTExpired = () =>
  new AppError('Token expired. Please login again.', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
   return sendDevError(err, res);
  } 
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);

    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpired();

    return sendProdError(error, res);
  }
  return res.status(err.statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
  });
};
