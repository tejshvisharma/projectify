const errorHandler = (err, req, res, next) => {
  const isCsrfError =
    err?.code === "EBADCSRFTOKEN" ||
    (typeof err?.message === "string" &&
      err.message.toLowerCase() === "invalid csrf token");

  const statuscode =
    err.statuscode || err.statusCode || (isCsrfError ? 403 : 500);
  const message = isCsrfError
    ? "Invalid CSRF token"
    : err.message || "Something went wrong";
  const errors = err.errors || null;

  const response = {
    success: false,
    message,
    errors,
  };

  // Only include stack trace in development
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(statuscode).json(response);
};

export default errorHandler;
