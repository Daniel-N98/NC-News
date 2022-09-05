const express = require("express");
const {
  fetchTopics,
  fetchArticleById,
} = require("./controllers/app.controller");

const app = express();

app.get("/api/topics", fetchTopics);
app.get("/api/articles/:article_id", fetchArticleById);

app.use((error, request, response, next) => {
  if (error.code && error.message) {
    response.status(error.code).send({ message: error.message });
  } else {
    response.status(400).send({ message: "Bad request" });
  }
});

module.exports = app;
