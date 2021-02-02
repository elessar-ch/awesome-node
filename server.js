const { json } = require("express");
const express = require("express");
const promBundle = require("express-prom-bundle");

const app = express();
const metricsMiddleware = promBundle({ includeMethod: true });

app.use(metricsMiddleware);
app.use(express.json());

const leak_increment_kb = parseInt(
  process.env.HEALTHCHECK_LEAK_INCREMENT_KB || 1000
);
let port = process.env.PORT || 8080;
let memory_waste = [];
let total_wasted_kb = 0;

app.get("/", (req, res) => {
  res.json({ hello: "World!" });
});
app.get("/random-nr", function (req, res) {
  let randomNr = 4; // Random number chosen by fair dice roll
  res.json({ randomValue: `${randomNr}` });
});
app.get("/slow-request", (req, res) => {
  if (!req.query.request_time) {
    res.status(400).send("Bad Request: must send get parameter request_time");
    return;
  }

  setTimeout(function () {
    res.json({
      waited: req.query.request_time + "s",
    });
  }, parseInt(req.query.request_time) * 1000);
});
app.post("/allocate-memory-kb", (req, res) => {
  if (!req.body.memory_size_kb) {
    res
      .status(400)
      .send("Bad Request: must send json body with memory_size_kb property");
    return;
  }
  let increment_kb = parseInt(req.body.memory_size_kb);
  let increment_byte = increment_kb * 1000;
  let increment = "*".repeat(increment_byte);

  memory_waste.push(increment);
  total_wasted_kb += increment_kb;
  res.json({
    alive: true,
    total_wasted_kb: total_wasted_kb,
    // Make sure the data is kept in the working set by accessing it
    lastByte: memory_waste[memory_waste.length - 1].charCodeAt(
      increment_byte - 1
    ),
  });
});
app.get("/healthcheck", (req, res) => {
  if (process.env.HEALTHCHECK_LEAK_MEMORY) {
    let increment_byte = leak_increment_kb * 1000;
    let increment = "*".repeat(increment_byte);

    memory_waste.push(increment);
    total_wasted_kb += leak_increment_kb;
    res.json({
      alive: true,
      total_wasted_kb: total_wasted_kb,
      // Make sure the data is kept in the working set by accessing it
      lastByte: memory_waste[memory_waste.length - 1].charCodeAt(
        increment_byte - 1
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
