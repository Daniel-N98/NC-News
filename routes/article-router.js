const {
  fetchArticleById,
  fetchArticles,
  patchArticle,
  fetchArticleComments,
  postArticleComment,
  postArticle,
} = require("../controllers/app.controller");
const articleRouter = require("express").Router();

articleRouter.route("/").get(fetchArticles).post(postArticle);
articleRouter.route("/:article_id").get(fetchArticleById).patch(patchArticle);
articleRouter
  .route("/:article_id/comments")
  .get(fetchArticleComments)
  .post(postArticleComment);

module.exports = articleRouter;
