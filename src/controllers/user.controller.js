import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req,res) => {
    // res.status(200).json({
    //     message: "Ok"
    // })
    
    //get user details from frontend
    const {fullName, email, userName, password } = req.body
    console.log(fullName)
    //validation-- not empty
    if([fullName, email, userName, password].some((field) => field?.trim() === "")){ // .some() is used for checking all fields
        throw new ApiError(400, "All fields are required")
    }// do all fields validation seperately by yourself

    //check if user already exits: user/email
    const existedUser = await User.findOne({
        $or: [{email},{userName}]
    })
    if(existedUser){
        throw new ApiError(409,"User already exists.")
    }
    //check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path //multer req.body ki jagah req.files deta h
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // console.log(avatarLocalPath,coverImageLocalPath);

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    //upload them cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary
    (coverImageLocalPath)
    //or we can use this
    // if(coverImage === undefined){
    //     coverImage = ""
    // }
    if(!avatar){
        throw new ApiError(400,"Avatar file not found")
    }
    //create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        userName: userName.toLowerCase(),
        email,
        password
    })
    //remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    console.log(createdUser)
    //check for user creation    
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    //return reponse
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created Successfully.")
    )
})

export {registerUser}