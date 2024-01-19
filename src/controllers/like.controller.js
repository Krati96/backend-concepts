import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(401, "Invalid videoId!");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  //toggel video like
  const likeVideo = await Like.findOne({ video: videoId, owner: userId });
  let like, unlike;
  if (likeVideo) {
    //if the user already like the video , unlike it
    unlike = await Like.findByIdAndDelete(likeVideo._id);
  } else {
    //like the video
    like = await Like.create({
      video: videoId,
      owner: userId,
    });
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        {},
        `Video ${unlike ? "unlike" : "like"} Successfully.`
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const userId = req.user._id;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(401, "Invalid commentId!");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  //toggel like
  const likeComment = await Like.findOne({ comment: commentId });
  let like, unlike;
  if (likeComment) {
    //if the user already like the comment , unlike it
    unlike = await Like.deleteOne(commentId);
  } else {
    //like the comment
    like = await Like.create({
      comment: commentId,
      owner: userId,
    });
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        {},
        `Comment ${unlike ? "unlike" : "like"} Successfully.`
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const userId = req.user._id;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(401, "Invalid commentId!");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  //toggel like
  const likeComment = await Like.findOne({ tweet: tweetId });
  let like, unlike;
  if (likeComment) {
    //if the user already like the comment , unlike it
    unlike = await Like.deleteOne(tweetId);
  } else {
    //like the comment
    like = await Like.create({
      tweet: tweetId,
      owner: userId,
    });
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        {},
        `Tweet ${unlike ? "unlike" : "like"} Successfully.`
      )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message
  const likedVideo = await Like.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "Video",
        localField: "video",
        foreignField: "_id",
        as: "likedVideos",
        pipeline: [
          {
            $lookup: {
              from: "User",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  console.log("Liked Videos lists", likedVideo);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        // likedVideo: likedVideo[0]?likedVideo || {}
      },
      "All liked videos fetched successfully"
    )
  );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
