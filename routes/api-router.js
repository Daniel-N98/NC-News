const apiRouter = require("express").Router();

const userRouter = require("./user-router.js");
const articleRouter = require("./article-router.js");
const topicsRouter = require("./topics-router.js");
const commentsRouter = require("./comment-router.js");
const { fetchEndpoints } = require("../controllers/app.controller.js");

apiRouter.get("/", fetchEndpoints);
apiRouter.use("/users", userRouter);
apiRouter.use("/articles", articleRouter);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
