const errorHandler = (err, req, res, next) => {
  const statuscode = err.statuscode || 500;
  const message = err.message || "Something went wrong";
  const errors = err.errors || null;

  res.status(statuscode).json({
    success: false,
    message,
    errors,
  });
};

export default errorHandler;
