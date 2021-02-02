const { json } = require("express");
const express = require("express");
const promBundle = require("express-prom-bundle");

const app = express();
const metricsMiddleware = promBundle({ includeMethod: true });

app.use(metricsMiddleware);
app.use(express.json());

let port = process.env.PORT || 8080;

// let memoryDump = [];
app.get("/", (req, res) => {
  res.json({ hello: "World!" });
});
app.get("/random-nr", function (req, res) {
  let randomNr = 4; // Random number chosen by fair dice roll
  res.json({ randomValue: `${randomNr}` });
});
app.get("/healthcheck", (req, res) => {
  if (process.env.HEALTHCHECK_LEAK_MEMORY) {
    if (!this.memorydump) {
      this.memorydump = [];
      this.i = 0;
    }

    this.increment_size = process.env.HEALTHCHECK_LEAK_INCREMENT_KB || 1000;
    let increment = "*".repeat(this.increment_size * 1000);

    this.memorydump.push(increment);
    res.json({
      alive: true,
      bytes: this.memorydump.length * this.increment_size,
      // Make sure the data is kept in the working set by accessing it
      lastByte: this.memorydump[this.memorydump.length - 1].charCodeAt(
        this.increment_size - 1
      ),
    });
  } else {
    res.json({
      alive: true,
    });
  }
});

var server = app.listen(port, function () {
  console.log(`Example app listening on port ${port}`);
});
