const {
  fetchUsers,
  fetchUserByUsername,
} = require("../controllers/users.controller.js");

const userRouter = require("express").Router();

userRouter.get("/", fetchUsers);
userRouter.get("/:username", fetchUserByUsername);

module.exports = userRouter;
