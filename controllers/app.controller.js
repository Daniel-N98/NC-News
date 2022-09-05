const { response } = require("../app.js");
const db = require("../db/connection");
const { fetchTopics, fetchArticleById } = require("../models/app.model.js");

exports.fetchTopics = (request, response, next) => {
  fetchTopics()
    .then((topics) => {
      response.status(200).send({ topics });
    })
    .catch((error) => next(error));
};

exports.fetchArticleById = (request, response, next) => {
  fetchArticleById(request.params.article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((error) => next(error));
};
