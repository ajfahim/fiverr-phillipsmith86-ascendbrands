// app/middlewares/globalErrorHandler.js
import ApiError from '../utils/ApiError.js';

const globalErrorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof SyntaxError ? 400 : 500;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const response = {
    success: false,
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
    }),
  };

  console.error('Error:', {
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack,
  });

  return res.status(error.statusCode).json(response);
};

export default globalErrorHandler;
