const {deleteCommentByID, patchCommentByID} = require('../models/app.model.js');

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