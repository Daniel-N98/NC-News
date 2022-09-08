const app = require("./app");

const { PORT = 9090 } = process.env;

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Listening on ${PORT}...`);
});