const {
  fetchArticleById,
  fetchArticles,
  patchArticle,
  fetchArticleComments,
  postArticleComment,
} = require("../controllers/app.controller");
const articleRouter = require("express").Router();

articleRouter.get("/", fetchArticles);
articleRouter.route("/:article_id").get(fetchArticleById).patch(patchArticle);
articleRouter
  .route("/:article_id/comments")
  .get(fetchArticleComments)
  .post(postArticleComment);

module.exports = articleRouter;
