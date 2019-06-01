// Requires
var express = require("express");

//Inicialiar variables
var app = new express();

// Escuchar peticiones

app.listen(3000, "localhost", () => {
  console.log("Express Server puerto\x1b[32m %s \x1b[0m%s", "3000", "online");
});
