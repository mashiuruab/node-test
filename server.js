var express = require('express');
var app = express();

app.get('/', function (req, res) {
    console.log("got the get request")
    res.send('Hello World');
})

// This responds a POST request for the homepage
app.post('/', function (req, res) {
    console.log("Got a POST request for the homepage");
    res.send('Hello POST');
})

var server = app.listen(8081, function () {
    console.log("Example app listening at http port 8081")
})