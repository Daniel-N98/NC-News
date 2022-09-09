const {
  deleteCommentByID,
  patchCommentByID,
} = require("../controllers/comments.controller.js");

const commentRouter = require("express").Router();

commentRouter
  .route("/:comment_id")
  .delete(deleteCommentByID)
  .patch(patchCommentByID);

module.exports = commentRouter;
