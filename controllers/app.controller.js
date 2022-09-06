const { response } = require("../app.js");
const db = require("../db/connection");
const {
  fetchTopics,
  fetchArticleById,
  fetchUsers,
  patchArticleById,
} = require("../models/app.model.js");

exports.fetchTopics = (request, response, next) => {
  fetchTopics()
    .then((topics) => {
      response.status(200).send({ topics });
    })
    .catch((error) => next(error));
};

exports.fetchArticleById = (request, response, next) => {
  const { article_id } = request.params;
  if (Number(article_id)) {
    fetchArticleById(article_id)
      .then((article) => {
        response.status(200).send({ article });
      })
      .catch((error) => next(error));
  } else {
    response.status(400).send({ message: "Invalid id" });
  }
};

exports.fetchUsers = (request, response, next) => {
  fetchUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch((error) => next(error));
};

exports.patchArticle = (request, response, next) => {
  const { article_id } = request.params;
  const { inc_votes } = request.body;
  patchArticleById(article_id, inc_votes)
    .then((updated_article) => {
      response.status(200).send({ updated_article });
    })
    .catch((error) => next(error));
};
