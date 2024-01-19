import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";

const getVideoComment = asyncHandler (async(req,res) => {
    const {videoId} = req.params
    const { page = 1, limit = 10 } = req.query
    if(!videoId){
        throw new ApiError(400,"Video not found")
    }
    try {
        const comment = await Comment.find({videoId})
        .skip((page-1)*limit)
        .limit(parseInt(limit));
        console.log("Comments",comment)

        return res.status(200)
        .json(new ApiResponse(200,comment, "Fetched video comment"))
    } catch (error) {
        
    }
})

const addComment = asyncHandler (async(req,res) => {

})

const updateComment = asyncHandler (async(req,res) => {
    
})

const deleteComment = asyncHandler (async(req,res) => {
    
})

export {
    getVideoComment,
    addComment,
    updateComment,
    deleteComment
}