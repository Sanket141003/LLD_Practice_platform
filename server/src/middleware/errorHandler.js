/**
 * Central error handler middleware.
 * Maps domain errors to appropriate HTTP responses.
 */
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.path} — ${err.message}`);

  // Validation errors from submission validator
  if (err.validationErrors) {
    return res.status(err.statusCode || 422).json({
      success: false,
      message: err.message,
      errors: err.validationErrors,
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }

  // Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  // Known domain errors
  const domainErrors = [
    'Problem not found',
    'Attempt not found',
    'Submission not found',
    'Evaluation not found',
    'Attempt has already been submitted',
    'Cannot update a completed attempt',
    'Can only retry a failed evaluation',
  ];

  if (domainErrors.some(msg => err.message.includes(msg))) {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.message.includes('Invalid status transition')) {
    return res.status(409).json({ success: false, message: err.message });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  });
}

module.exports = errorHandler;
