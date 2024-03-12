import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  const userId = req.user._id;

  if (!content) {
    throw new ApiError(400, "Content not found");
  }

  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  if (!tweet) {
    throw new ApiError(500, "Something went wrong while creating tweet.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet Created Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const tweetId = req.user._id;
  if (!tweetId) {
    throw new ApiError(400, "User Tweet not found!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Get User Tweets succcessfully."));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { newContent } = req.body;
  const userId = req.user._id;
  const { tweetId } = re.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "tweet id is incorrect!");
  }
  if (!newContent) {
    throw new ApiError(400, "Tweet content is required");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "Tweet not found");
  }

  if (tweet.owner.toString() !== userId) {
    throw new ApiError(400, "You are not authorised to update tweet.");
  }

  const updateTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
        $set: {
            content: newContent
        }
    },
    { $new : true }
  )

  if(!updateTweet){
    throw new ApiError(500,"Something went wrong while updating tweet!")
  }

  return res.status(201)
  .json(new ApiResponse(201,
    { updateTweet},
    "Tweet updated successfully!"
    ))
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { userId } = req.user._id
  const tweetId = req.params

  if(isValidObjectId(tweetId)){
    throw new ApiError(400,"Tweet is missing!")
  }
  //check ownership of the tweet to delete
  const tweet = await Tweet.findById(tweetId)
  if(tweet.owner.toString() !== userId){    
    throw new ApiError(400,"You are not the owner of this Tweet.")
  }

  const deleteTweet = await Tweet.findByIdAndDelete({_id:tweetId})
  console.log("deleted tweet id: ",deleteTweet)
  if(!deleteTweet){    
    throw new ApiError(500,"Something went wrong while deleting tweet.")
  }
  return res.status(200)
  .json(new ApiResponse(200, {deleteTweet}, "Tweet deleted Successfully"))
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
