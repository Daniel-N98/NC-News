const {
  deleteCommentByID,
  patchCommentByID,
} = require("../controllers/app.controller");

const commentRouter = require("express").Router();

commentRouter
  .route("/:comment_id")
  .delete(deleteCommentByID)
  .patch(patchCommentByID);

module.exports = commentRouter;
