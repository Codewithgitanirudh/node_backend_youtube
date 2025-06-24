import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.Modal.js';
import uploadOnCloudinary from '../utils/fileUpload.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import jwt from 'jsonwebtoken';

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
  console.log(avatarLocalPath, 'avatarLocalPath');
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
    username: username.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select('-password -refreshToken');
  console.log(createdUser, 'createdUser');
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong');
  }

  return res.status(201).json(new ApiResponse(200, createdUser, 'User registered successfully'));
});

const generateRefreshAndAccessToken = async userId => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong');
  }
};

const loginUser = asyncHandler(async (req, res) => {
  //req.body -> data
  //username or email
  //find user
  //compare password
  //access or refresh token
  //send cookie

  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, 'Username or email is required');
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid password');
  }

  const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user,
          accessToken,
          refreshToken,
        },
        'User logged in successfully',
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true },
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized');
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      throw new ApiError(401, 'invalid refresh token');
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, errors?.message || 'refresh token mismatch');
    }

    const cookieOptions = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } = await generateRefreshAndAccessToken(user._id);

    return res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', newrefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            newrefreshToken,
          },
          'Refresh token generated successfully',
        ),
      );
  } catch (error) {
    throw new ApiError(401, 'invalid refresh token');
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
