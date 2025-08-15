import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const isLoggedIn = asyncHandler(async (req, res, next) => {
  console.log(req.cookies);

  const accessToken = req.cookies?.accessToken;
  console.log("TOKEN FOUND :", accessToken ? "yes" : "no");

  if (!accessToken) {
    throw new ApiError(401, "No Token Found, Authentication Failed");
  }


    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // or await User.findById(decoded.id)
    next();

});

export default isLoggedIn;
