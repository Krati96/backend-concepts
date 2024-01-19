import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteOnClodinary, uploadOnCloudinary} from "../utils/cloudinary.js"

const getCloudinaryLink = (url) => {
    const linkUrl = url.split('/')
    const modifyLink = linkUrl[linkUrl.length - 1].split('.')[0]
    return modifyLink;
}

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    try {
        const parseLimit = parseInt(limit)
        const skipPage = (page-1)*parseLimit
        const sortStage = {}
        sortStage[sortBy] = sortType === 'asc' ? 1 : -1
        const allVideo = await Video.aggregate([
            {
                $match: { isPublished: true}
            },
            {
                $lookup:{
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as : "ownerData",
                    pipeline:[
                        {
                            $project:{
                                userName: 1,
                                avatar :1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    owner_details: {
                        $arrayElemAt: ["$ownerData",0]
                    }
                }
            },
            {
                $skip: skipPage
            },
            {
                $limit: parseLimit
            },
            {
                $sort: sortStage
            },
            {
                $project: { ownerData: 0 }
            }
        ])
      
        // const video = await Video.find(dbQuery)
        // .sort(sortBy,sortType)
        // .skip((page-1)*limit)
        // .limit(parseInt(limit))

        return res.status(200)
        .json(new ApiResponse(200, allVideo, "Videos fetched successfully"))
    } catch (error) {
        console.log("Error found:",error);
        throw new ApiError(500,"Something went wrong")
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!(title &&description)){
        throw new ApiError(400,"Please provide title or description");
    }
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbNailPath = req.files?.thumbNail[0]?.path;
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)
    const uploadedThumbnail = await uploadOnCloudinary(thumbNailPath)
    if (!uploadedVideo) {
        throw new ApiError(400, "Video file not uploaded on cloudinary");
    }
    const newVideo = await Video.create({
        title,
        description,
        videoFile:uploadedVideo?.url || "",
        thumbNail: uploadedThumbnail?.url || "",
        duration: uploadedVideo?.duration || 0,
        owner: req.user,        
    })

    console.log(newVideo);
    if (!newVideo) {
        throw new ApiError(500, "Something went wrong while Publish the video");
    }
      //return reponse
    return res
        .status(201)
        .json(new ApiResponse(200, createdVideo, "Video created Successfully."));    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(400,"Please select video")
    }
    const video = await Video.findById(videoId)
    console.log(video);
    if(!video){
        throw new ApiError(400,"Video not found.")
    }
    return res.status(200)
    .json(new ApiResponse(200,video,"Video found successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description, thumbnail } = req.body;
    if([videoId,title, description, thumbnail].some((field) => field.trim() === "")){
        throw new ApiError(400,"All fields is required")
    }
    try {
        const updatedVideo = await Video.findOneAndUpdate(
            {_id: videoId},
            { $set:{
                title,description,thumbnail
            }},
            {new: true}
        )
        console.log(updatedVideo)
        if(!updatedVideo){
            throw new ApiError(400,"Something went wrong while updating video details.")
        }
        return res.status(200)
        .json(new ApiResponse(200, updatedVideo, "Video details updated Successfully"))
    } catch (error) {
        throw new ApiError(500,"Internal Server Error")
    }
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(isValidObjectId(videoId)){
        throw new ApiError(400,"Video is missing")
    }
    const deleteToBeVideo = await Video.findOneAndDelete({_id: videoId})
    console.log(deleteToBeVideo)
    if(!deleteToBeVideo){
        throw new ApiError(400,"Something went wrong while deleting video")
    }
    //check the ownership of the video
    if(!req.user._id.equals(deleteToBeVideo.owner._id)){
        throw new ApiError(400,"You are not the owner of this Video.")
    }
    const videoFile = getCloudinaryLink(deleteToBeVideo.videoFile)
    const thumbNail = getCloudinaryLink(deleteToBeVideo.thumbNail)

    const deleteVideo = await deleteOnClodinary(videoFile)
    const deleteThumbnail = await deleteOnClodinary(thumbNail)
    return res.status(200)
    .json(new ApiResponse(200, {deleteVideo,deleteThumbnail}, "Video deleted Successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(isValidObjectId(videoId)){
        throw new ApiError(401,"Video not found")
    }
    const video = await Video.findById(videoId);

    video.isPublished = !video.isPublished
    const updatedVideo = await video.save();
    if(!updatedVideo){
        throw new ApiError(400,"Video not updated")
    }
    return res.status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated Successfully."))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}