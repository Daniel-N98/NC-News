const express = require("express");
const apiRouter = require("./routes/api-router.js");

const app = express();
app.use(express.json());

app.use("/api", apiRouter);

app.use((error, request, response, next) => {
  if (error.code && error.message) {
    response.status(error.code).send({ message: error.message });
  } else {
    response.status(400).send({ message: "Bad request" });
  }
});

module.exports = app;
