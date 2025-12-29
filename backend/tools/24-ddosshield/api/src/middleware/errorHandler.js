/**
 * Error Handler Middleware
 */

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: messages,
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: "Duplicate entry",
      field: Object.keys(err.keyPattern)[0],
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
};

module.exports = { errorHandler };
