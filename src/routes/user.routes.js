import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changePassword,
  updateUser,
  updateUserAvatar,
  getUserChannels,
  getWatchHistory,
} from '../controllers/user.controller.js';
import upload from '../middlewares/multer.middleware.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(upload.fields([{ name: 'avatar' }, { name: 'coverImage' }]), registerUser);
router.route('/login').post(loginUser);

//secure routes
router.route('/logout').post(verifyAccessToken, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/current-user').get(verifyAccessToken, getCurrentUser);
router.route('/update-user').patch(verifyAccessToken, updateUser);
router.route('/update-user-avatar').patch(verifyAccessToken, upload.single('avatar'), updateUserAvatar);
router.route('/change-password').post(verifyAccessToken, changePassword);
router.route('/channel/:username').get(verifyAccessToken, getUserChannels);
router.route('/watch-history').get(verifyAccessToken, getWatchHistory);

export default router;
