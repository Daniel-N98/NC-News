const {
  fetchArticleById,
  fetchArticles,
  patchArticle,
  fetchArticleComments,
  postArticleComment,
  postArticle,
  deleteArticle,
} = require("../controllers/articles.controller.js");
const articleRouter = require("express").Router();

articleRouter.route("/").get(fetchArticles).post(postArticle);
articleRouter
  .route("/:article_id")
  .get(fetchArticleById)
  .patch(patchArticle)
  .delete(deleteArticle);
articleRouter
  .route("/:article_id/comments")
  .get(fetchArticleComments)
  .post(postArticleComment);

module.exports = articleRouter;
