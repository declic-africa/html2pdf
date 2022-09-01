const express = require('express');
const appSource = require("./src/source");
const appPdf = require("./src/pdf");
const appPng = require("./src/png");

let port = process.env.PORT || 8887;
let app = express();

appSource(app)
appPdf(app)
appPng(app)

// Launch the server and listen to XXXX
app.listen(port, "0.0.0.0", function() {
	console.log("Listening on port", port);
});

// If an exception occurs, log it
process.on('uncaughtException', function (err) {
	console.log(err);
});
