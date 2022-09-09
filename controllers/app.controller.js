const { response } = require("../app.js");
const db = require("../db/connection");
const {
  fetchTopics,
  fetchArticleById,
  fetchUsers,
  patchArticleById,
  fetchArticles,
  fetchArticleComments,
  postArticleComment,
  deleteCommentByID,
  fetchEndpoints,
  fetchUserByUsername,
  patchCommentByID,
  postArticle,
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

exports.fetchUserByUsername = (request, response, next) => {
  fetchUserByUsername(request.params.username)
    .then((user) => {
      response.status(200).send({ user });
    })
    .catch((error) => next(error));
};

exports.patchArticle = (request, response, next) => {
  const { article_id } = request.params;
  if (!request.body.hasOwnProperty("inc_votes")) {
    response.status(400).send({ message: "Bad request" });
  }
  const { inc_votes } = request.body;
  patchArticleById(article_id, inc_votes)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((error) => next(error));
};

exports.fetchArticles = (request, response, next) => {
  fetchArticles(request)
    .then((articles) => {
      response.status(200).send({ articles });
    })
    .catch((error) => next(error));
};

exports.fetchArticleComments = (request, response, next) => {
  fetchArticleComments(request.params.article_id)
    .then((comments) => {
      response.status(200).send({ comments });
    })
    .catch((error) => next(error));
};

exports.postArticleComment = (request, response, next) => {
  postArticleComment(request.params.article_id, request.body)
    .then((comment) => {
      response.status(201).send({ comment });
    })
    .catch((error) => next(error));
};

exports.deleteCommentByID = (request, response, next) => {
  deleteCommentByID(request.params.comment_id)
    .then(() => {
      response.sendStatus(204);
    })
    .catch((error) => next(error));
};

exports.patchCommentByID = (request, response, next) => {
  patchCommentByID(request.params.comment_id, request.body)
    .then((comment) => {
      response.status(200).send({ comment });
    })
    .catch((error) => next(error));
};

exports.fetchEndpoints = (request, response, next) => {
  response.status(200).send(fetchEndpoints());
};

exports.postArticle = (request, response, next) => {
  postArticle(request.body)
    .then((article) => {
      response.status(201).send({ article });
    })
    .catch((error) => next(error));
};
