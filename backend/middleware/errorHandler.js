// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    if (err.keyPattern && err.keyPattern.email) {
      message = 'An account with this email address already exists.';
    } else if (err.keyPattern && (err.keyPattern.customer || err.keyPattern.restaurant)) {
      message = 'You have already reviewed this restaurant. You can update your existing review instead.';
    } else {
      message = 'Duplicate entry detected. This resource already exists.';
    }
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource ID: ${err.value}`;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join('. ');
  }

  // JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  console.error(`[Error] [${req.method} ${req.originalUrl}] - Status: ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
