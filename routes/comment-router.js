const { deleteCommentByID } = require("../controllers/app.controller");

const commentRouter = require("express").Router();

commentRouter.delete("/:comment_id", deleteCommentByID);

module.exports = commentRouter;
