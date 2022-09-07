const express = require("express");
const {
  fetchTopics,
  fetchArticleById,
  fetchUsers,
  patchArticle,
  fetchArticles,
  fetchArticleComments,
} = require("./controllers/app.controller");

const app = express();
app.use(express.json());

app.get("/api/topics", fetchTopics);
app.get("/api/articles", fetchArticles);
app.get("/api/articles/:article_id", fetchArticleById);
app.get("/api/articles/:article_id/comments", fetchArticleComments);
app.get("/api/users", fetchUsers);
app.patch("/api/articles/:article_id", patchArticle);

app.use((error, request, response, next) => {
  if (error.code && error.message) {
    response.status(error.code).send({ message: error.message });
  } else {
    response.status(400).send({ message: "Bad request" });
  }
});

module.exports = app;
