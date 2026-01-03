function asyncHandler(requestHandler) {
  return function (req, res, next) {
    Promise.resolve(requestHandler(req, res))
      .catch(function (err) {
        next(err);
      });
  };
}

export { asyncHandler };
