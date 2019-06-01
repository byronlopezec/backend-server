// Iniciar servidor
// node app

// iniciar servidor Con nodemon: installarlo> npm install -g nodemon
// nodemon app.js

// Requires
var express = require("express");

//Inicialiar variables
var app = new express();

// rutas
app.get("/", (request, response, next) => {
  response
    .status(200)
    .json({ ok: true, message: "Peticion realizada exitosamente" });
});

// Escuchar peticiones
app.listen(3000, "localhost", () => {
  console.log("Express Server puerto\x1b[32m %s \x1b[0m%s", "3000", "online");
});
