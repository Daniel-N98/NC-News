const { fetchUsers } = require("../controllers/app.controller");

const userRouter = require("express").Router();

userRouter.get("/", fetchUsers);

module.exports = userRouter;
