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
  console.log(
    JSON.stringify({
      time: new Date(new Date().toUTCString()),
      requestPath: req.path,
      requestQuery: req.query,
      type: "getBasePath",
      message: "Returning hello world",
    })
  );
  res.json({ hello: "World!" });
});
app.get("/random-nr", function (req, res) {
  let randomNr = 4; // Random number chosen by fair dice roll

  console.log(
    JSON.stringify({
      time: new Date(new Date().toUTCString()),
      requestPath: req.path,
      requestQuery: req.query,
      type: "getRandomNr",
      message: `Returning random nr (${randomNr})`,
    })
  );
  res.json({ randomValue: `${randomNr}` });
});
app.get("/slow-request", (req, res) => {
  if (!req.query.request_time) {
    res.status(400).send("Bad Request: must send get parameter request_time");
    return;
  }

  console.log(
    JSON.stringify({
      time: new Date(new Date().toUTCString()),
      requestPath: req.path,
      requestQuery: req.query,
      type: "preSlowRequest",
      message: `Entering slow request (${req.query.request_time} seconds)`,
    })
  );

  setTimeout(function () {
    console.log(
      JSON.stringify({
        time: new Date(new Date().toUTCString()),
        requestPath: req.path,
        requestQuery: req.query,
        type: "postSlowRequest",
        message: `Slow request done (${req.query.request_time} seconds)`,
      })
    );
    res.json({
      waited: req.query.request_time + "s",
    });
  }, parseFloat(req.query.request_time) * 1000);
});
app.post("/allocate-memory-kb", (req, res) => {
  if (!req.body.memory_size_kb) {
    res
      .status(400)
      .send("Bad Request: must send json body with memory_size_kb property");
    return;
  }
  console.log(
    JSON.stringify({
      time: new Date(new Date().toUTCString()),
      requestPath: req.path,
      requestQuery: req.query,
      type: "preAllocateMemoryKB",
      message: `Trying to allocate ${req.body.memory_size_kb} KB`,
    })
  );
  let increment_kb = parseInt(req.body.memory_size_kb);
  let increment_byte = increment_kb * 1000;
  let increment = "*".repeat(increment_byte);

  memory_waste.push(increment);
  total_wasted_kb += increment_kb;
  // Make sure the data is kept in the working set by accessing it
  let lastByte = memory_waste[memory_waste.length - 1].charCodeAt(
    increment_byte - 1
  );

  console.log(
    JSON.stringify({
      time: new Date(new Date().toUTCString()),
      requestPath: req.path,
      requestQuery: req.query,
      type: "postAllocateMemoryKB",
      message: `Allocated ${req.body.memory_size_kb} KB`,
    })
  );
  res.json({
    alive: true,
    total_wasted_kb: total_wasted_kb,
    lastByte: lastByte,
  });
});
app.get("/healthcheck", (req, res) => {
  if (process.env.HEALTHCHECK_LEAK_MEMORY) {
    console.log(
      JSON.stringify({
        time: new Date(new Date().toUTCString()),
        requestPath: req.path,
        requestQuery: req.query,
        type: "preHealthCheckWithAllocation",
        message: `Allocating ${leak_increment_kb} KB`,
      })
    );

    let increment_byte = leak_increment_kb * 1000;
    let increment = "*".repeat(increment_byte);

    memory_waste.push(increment);
    total_wasted_kb += leak_increment_kb;
    // Make sure the data is kept in the working set by accessing it
    let lastByte = memory_waste[memory_waste.length - 1].charCodeAt(
      increment_byte - 1
    );

    console.log(
      JSON.stringify({
        time: new Date(new Date().toUTCString()),
        requestPath: req.path,
        requestQuery: req.query,
        type: "postHealthCheckWithAllocation",
        message: `Allocated ${leak_increment_kb} KB`,
      })
    );
    res.json({
      alive: true,
      total_wasted_kb: total_wasted_kb,
      lastByte: lastByte,
    });
  } else {
    console.log(
      JSON.stringify({
        time: new Date(new Date().toUTCString()),
        requestPath: req.path,
        requestQuery: req.query,
        type: "healthCheckStandard",
        message: "Healthcheck returning alive=true",
      })
    );
    res.json({
      alive: true,
    });
  }
});

var server = app.listen(port, function () {
  console.log(`Example app listening on port ${port}`);
});
