const {
  fetchArticleById,
  patchArticleById,
  fetchArticles,
  postArticle,
  deleteArticleById,
  fetchArticleComments,
  postArticleComment,
} = require("../models/app.model.js");
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

exports.postArticle = (request, response, next) => {
  postArticle(request.body)
    .then((article) => {
      response.status(201).send({ article });
    })
    .catch((error) => next(error));
};

exports.deleteArticle = (request, response, next) => {
  deleteArticleById(request)
    .then((article) => {
      response.status(204).send({ article });
    })
    .catch((error) => next(error));
};

exports.fetchArticleComments = (request, response, next) => {
  fetchArticleComments(request)
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