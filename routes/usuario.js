var express = require("express");
var usuarios = require("../modules/usuario");

var app = new express();

app.get("/", (request, response, next) => {
  usuarios.find({}, "nombre email img role").exec((err, res) => {
    if (err) {
      return response.status(500).json({
        ok: false,
        message: "Error cargando usuario",
        errors: err
      });
    }
    response.status(200).json({
      usuarios: res
    });
  });
});

module.exports = app;
