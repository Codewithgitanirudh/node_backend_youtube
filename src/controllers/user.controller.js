import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.Modal.js';
import uploadOnCloudinary from '../utils/fileUpload.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some(field => field?.trim() === '')) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    throw new ApiError(409, 'User already exists');
  }
  console.log(req.files, 'req.files');

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar is required');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(avatar, 'avatar');
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, 'Avatar is required');
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || null,
    email,
    username : username.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select('-password -refreshToken');
  console.log(createdUser, 'createdUser');
  if(!createdUser) {
    throw new ApiError(500, 'Something went wrong');
  }

  return res.status(201).json(new ApiResponse(200, createdUser, 'User registered successfully'));
});

export { registerUser };
