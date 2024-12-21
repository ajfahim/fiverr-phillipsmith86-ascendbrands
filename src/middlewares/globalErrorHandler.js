// app/middlewares/globalErrorHandler.js

const globalErrorHandler = (err, req, res, next) => {
  console.error(err);

  // Default error handler for other cases
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

export default globalErrorHandler;
