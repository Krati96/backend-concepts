import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import jwt from "jsonwebtoken";
import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";

const getVideoComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(400, "Video not found");
  }
  try {
    const comment = await Comment.find({ videoId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    console.log("Comments", comment);

    return res
      .status(200)
      .json(new ApiResponse(200, comment, "Fetched video comment"));
  } catch (error) {}
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.query;
  const { content } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video!");
  }
  if (!content) {
    throw new ApiError(400, "Comment content not found");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { comment }, "Comment added Successfully."));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { newContent } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment Id!");
  }
  if (!newContent) {
    throw new ApiError(400, "Comment content is required");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  if (comment.owner.toString() !== userId) {
    throw new ApiError(400, "You are not authorised to update comment.");
  }
  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: newContent,
      },
    },
    { new: true }
  );

  if (!updateComment) {
    throw new ApiError(404, "Something went wrong while updating comment.");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, { updateComment }, "Comment updated Successfully.")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment Id!");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  if (comment.owner.toString() !== userId) {
    throw new ApiError(400, "You are not authorised to delete comment.");
  }
  const deleteComment = await Comment.findByIdAndDelete(commentId);
  if (!deleteComment) {
    throw new ApiError(404, "Something went wrong while deleting comment.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted Successfully."));
});

export { getVideoComment, addComment, updateComment, deleteComment };
