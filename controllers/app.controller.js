const {
  fetchEndpoints,
} = require("../models/app.model.js");

exports.fetchEndpoints = (request, response, next) => {
  response.status(200).send(fetchEndpoints());
};
