const { fetchTopics, postTopic } = require("../controllers/app.controller");
const topicsRouter = require("express").Router();

topicsRouter.route("/").get(fetchTopics).post(postTopic);

module.exports = topicsRouter;
