var express = require("express");
var fileSystem = require("fs");
var app = new express();

app.get("/:tipo/:img", (request, response) => {
  var tipo = request.params.tipo;
  var img = request.params.img;

  var path = `./uploads/${tipo}/${img}`;
  var pathNoImagen = "./assets/imagenes/empty.img.002.png";

  if (!fileSystem.existsSync(path)) {
    return response.sendFile(pathNoImagen, { root: "." });
  }
  response.sendFile(path, { root: "." });
});

module.exports = app;
