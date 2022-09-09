const { fetchTopics, postTopic } = require("../controllers/topics.controller");
const topicsRouter = require("express").Router();

topicsRouter.route("/").get(fetchTopics).post(postTopic);

module.exports = topicsRouter;
