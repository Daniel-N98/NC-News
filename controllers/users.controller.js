const {fetchUsers, fetchUserByUsername} = require('../models/app.model.js');

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