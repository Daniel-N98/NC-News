const { fetchTopics } = require("../controllers/app.controller");
const topicsRouter = require("express").Router();

topicsRouter.get("/", fetchTopics);

module.exports = topicsRouter;
