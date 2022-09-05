const { response } = require("../app.js");
const db = require("../db/connection");
const { fetchTopics } = require("../models/app.model.js");

exports.fetchTopics = (request, response, next) => {
  fetchTopics()
    .then((rows) => {
      response.status(200).send({ rows });
    })
    .catch((error) => next(error));
};
