import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware";
import {
  addComment,
  deleteComment,
  getVideoComment,
  updateComment,
} from "../controllers/comment.controller";

const router = Router();
router.use(verifyJwt);

router.route("/:videoId").get(getVideoComment).post(addComment);
router.route("/comment/:commentId").patch(updateComment).delete(deleteComment);

export default router;
