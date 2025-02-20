import ApiError from '../utils/ApiError.js';

export const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof SyntaxError ? 400 : 500;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }

  res.locals.errorMessage = err.message;

  const response = {
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  };

  res.status(statusCode).json(response);
};
