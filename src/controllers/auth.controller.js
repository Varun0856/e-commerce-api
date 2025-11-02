import prisma from '../database/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/AsyncHandler.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokenUtils.js'
import bcrypt from 'bcrypt'

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.headers["x-refresh-token"];

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decodedToken;
  try {
    decodedToken = verifyRefreshToken(incomingRefreshToken);
  } catch (err) {
    throw new ApiError(403, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decodedToken.userId,
    },
    select: {
      id: true,
      refreshToken: true
    }
  });

  if (!user) throw new ApiError(404, "User not found");

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(403, "Token mismatch or reused refresh token");
  };

  const newAccessToken = generateAccessToken(user.id);

  res.status(200).cookie("accessToken", newAccessToken, { httpOnly: true, secure: false }).json(
    new ApiResponse(200, { accessToken: newAccessToken }, "Access token refreshed successfully")
  );
});

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, phonenumber, password } = req.body;
  if ([fullname, email, phonenumber, password].some((fields) => {
    return !fields || fields?.trim() === '';
  })) {
    throw new ApiError(400, "The required fields must be filled");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email },
        { phonenumber: phonenumber }
      ],
    },
  });

  if (existingUser) {
    throw new ApiError(400, "User with that email or phonenumber already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      fullname,
      email,
      phonenumber,
      password: hashedPassword,
      role: 'USER',
    },
    select: {
      id: true,
      fullname: true,
      email: true,
      phonenumber: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });


  res.status(201).json(
    new ApiResponse(201, newUser, "User registered successfully")
  );
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, phonenumber, password } = req.body;
  if (!(email || phonenumber)) {
    throw new ApiError(400, "email or phonenumber is required");
  }

  if (!password) {
    throw new ApiError(400, "Missing password");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email },
        { phonenumber: phonenumber },
      ],
    },
    select: {
      id: true,
      password: true,
      refreshToken: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  };

  const isPassword = await bcrypt.compare(password, user.password);
  if (!isPassword) {
    throw new ApiError(401, "Invalid credentials");
  }
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  const updatedUser = await prisma.user.update({
    data: {
      refreshToken: refreshToken,
    },
    where: {
      email: email,
    },
    select: {
      id: true,
      fullname: true,
      email: true,
      phonenumber: true,
    },
  });

  res.status(200).cookie("accessToken", accessToken, { httpOnly: true, secure: false }).cookie("refreshToken", refreshToken, { httpOnly: true, secure: false }).json(new ApiResponse(200, { user: updatedUser }, "Login Successful"));
})

export { refreshAccessToken, registerUser, loginUser };


