import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { searchUsers } from "../controllers/user.controllers.js";
import { searchUsersValidator } from "../validators/user.validators.js";

const router = Router();

router
  .route("/search")
  .get(isLoggedIn, searchUsersValidator(), validate, searchUsers);

export default router;
