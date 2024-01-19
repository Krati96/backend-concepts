import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";


const getChannelStatus = asyncHandler(async(req,res)=>{

})

const getChannelVideos = asyncHandler(async(req,res)=>{
    
})

export {
    getChannelVideos,
    getChannelStatus
}