const {
  fetchUsers,
  fetchUserByUsername,
} = require("../controllers/app.controller");

const userRouter = require("express").Router();

userRouter.get("/", fetchUsers);
userRouter.get("/:username", fetchUserByUsername);

module.exports = userRouter;
