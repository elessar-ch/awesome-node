const express = require("express");
const promBundle = require("express-prom-bundle");

const app = express();
const metricsMiddleware = promBundle({ includeMethod: true });

app.use(metricsMiddleware);
app.use(express.json());

let port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.json({ hello: "World!" });
});
app.get("/random-nr", function (req, res) {
  let randomNr = 4; // Random number chosen by fair dice roll
  res.json({ randomValue: `${randomNr}` });
});

var server = app.listen(port, function () {
  console.log(`Example app listening on port ${port}`);
});
