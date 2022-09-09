const {fetchTopics, postTopic} = require('../models/app.model.js')

exports.fetchTopics = (request, response, next) => {
  fetchTopics()
    .then((topics) => {
      response.status(200).send({ topics });
    })
    .catch((error) => next(error));
};

exports.postTopic = (request, response, next) => {
  postTopic(request)
    .then((topic) => {
      response.status(201).send({ topic });
    })
    .catch((error) => next(error));
};