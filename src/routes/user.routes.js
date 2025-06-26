import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields([{name: "avatar"}, {name: "coverImage"}]), registerUser);
router.route("/login").post(loginUser);

//secure routes
router.route("/logout").post(verifyAccessToken, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/channels/:username").get(verifyAccessToken, getUserChannels);

export default router;