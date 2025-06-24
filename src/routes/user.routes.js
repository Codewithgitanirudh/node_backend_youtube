import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields([{name: "avatar"}, {name: "coverImage"}]), registerUser);
router.route("/login").post(loginUser);

//secure routes
router.route("/logout").post(verifyAccessToken, logoutUser);

export default router;