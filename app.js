const express = require("express");
const { fetchTopics } = require("./controllers/app.controller");

const app = express();

app.get("/api/topics", fetchTopics);

app.use((error, request, response, next) => {
  if (error.code && error.error) {
    response.status(error.code).send({ message: error.error });
  } else {
    response.status(400).send({ message: "Bad request" });
  }
});

module.exports = app;
