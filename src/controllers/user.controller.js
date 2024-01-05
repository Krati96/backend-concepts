import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //     message: "Ok"
  // })

  //get user details from frontend
  const { fullName, email, userName, password } = req.body;
  // console.log(fullName)
  //validation-- not empty
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    // .some() is used for checking all fields
    throw new ApiError(400, "All fields are required");
  } // do all fields validation seperately by yourself

  //check if user already exits: user/email
  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists.");
  }
  //check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path; //multer req.body ki jagah req.files deta h
  // const coverImageLocalPath = req.files?.coverImage[0]?.path
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  // console.log(avatarLocalPath,coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  //upload them cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  //or we can use this
  // if(coverImage === undefined){
  //     coverImage = ""
  // }
  if (!avatar) {
    throw new ApiError(400, "Avatar file not found");
  }
  //create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    userName: userName.toLowerCase(),
    email,
    password,
  });
  //remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // console.log(createdUser)
  //check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  //return reponse
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created Successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  //get data from req.bdy
  const { email, userName, password } = req.body;
  //username or email
  if (!(userName || email)) {
    throw new ApiError(400, "UserName or Password is required");
  }
  //find user in db if its registered
  const logUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  //validation -- not empty
  if (!logUser) {
    throw new ApiError(404, "User does not exists.");
  }
  //check password
  const isPassValid = await logUser.isPasswordCorrect(password);
  if (!isPassValid) {
    throw new ApiError(401, "Invalid user credentials.");
  }
  //access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    logUser._id
  );
  const loggedInUser = await User.findById(logUser._id).select(
    "-password -refreshToken"
  );
  //send cookies
  const options = {
    httpOnly: true,
    secure: true,
  };
  //send response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully."
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id, // ye user verifyjwt s middleware hote hue aya h
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  //send response
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out Successfully."));
});

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user1 = await User.findById(userId);
    const accessToken = user1.generateAccessToken();
    const refreshToken = user1.generateRefreshToken();
    // console.log("genrated token:",accessToken,refreshToken)

    user1.refreshToken = refreshToken;
    await user1.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token."
    );
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request.");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = await User.findById(decodedToken?._id);
  
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired or used")
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
    return res
      .status(200)
      .clearCookie("accessToken", accessToken, options)
      .clearCookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, {accessToken,refreshToken: newRefreshToken}, "Access Token refreshed Successfully."));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token.")
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
