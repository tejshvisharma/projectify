import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { getGlobalLeaderboard } from "../controllers/leaderboard.controller.js";

const router = Router();

router.route("/global").get(isLoggedIn, getGlobalLeaderboard);

export default router;
