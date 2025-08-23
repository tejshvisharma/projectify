import { Router } from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controllers.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCommentValidator,
  updateCommentValidator,
} from "../validators/comment.validators.js";

const router = Router();

router
  .route("/:taskId")
  .post(isLoggedIn, createCommentValidator(), validate, createComment)
  .get(isLoggedIn, getComments);

router
  .route("/edit/:commentId")
  .patch(isLoggedIn, updateCommentValidator(), validate, updateComment)
  .delete(isLoggedIn, deleteComment);

export default router;
