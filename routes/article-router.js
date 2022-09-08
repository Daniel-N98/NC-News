const {
  fetchArticleById,
  fetchArticles,
  patchArticle,
  fetchArticleComments,
  postArticleComment,
} = require("../controllers/app.controller");
const articleRouter = require("express").Router();

articleRouter.get("/", fetchArticles);
articleRouter.get("/:article_id", fetchArticleById);
articleRouter.patch("/:article_id", patchArticle);
articleRouter.get("/:article_id/comments", fetchArticleComments);
articleRouter.post("/:article_id/comments", postArticleComment);

module.exports = articleRouter;
