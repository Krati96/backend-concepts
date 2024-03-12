import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";


const getChannelStatus = asyncHandler(async(req,res)=>{
    //get lists of total likes,total comments, total views, total tweets, total videos,etc
    const userId = req.user._id;
    const totalVideos = await Video.aggregate([
        {
           $match: {
            owner: new Types 
           } 
        }
    ])
    

})

const getChannelVideos = asyncHandler(async(req,res)=>{
    
})

export {
    getChannelVideos,
    getChannelStatus
}