var express = require('express');
var app = express();

let port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send("Hello, World!")
})
app.get('/random-nr', function(req, res) {
    let randomNr = 4 // Random number chosen by fair dice roll
    res.send(`${randomNr}`);
})

var server = app.listen(port, function() {
    console.log(`Example app listening on port ${port}`)
})