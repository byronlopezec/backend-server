var express = require("express");

var app = new express();

app.get("/", (request, response) => {
  response.status(200).json({ ok: true, message: "Peticion realizada exitosamente" });
});

module.exports = app;
