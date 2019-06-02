var express = require("express");
var usuarioModel = require("../models/usuario");
var bcrypt = require("bcryptjs");

var app = new express();

// ========== *** Obtener lista de usuarios ***
app.get("/", (request, response, next) => {
  usuarioModel.find({}, "nombre email img role").exec((err, res) => {
    if (err) {
      return response.status(500).json({
        ok: false,
        message: "Error cargando usuario",
        err
      });
    }

    response.status(200).json({
      usuarios: res
    });
  });
});

// ========== *** Agregar nuevo usuario ***
app.post("/", (request, response, next) => {
  var body = request.body;
  var usuario = new usuarioModel({ ...body, password: bcrypt.hashSync(body.password, 10) });

  usuario.save((err, usuarioSaved) => {
    if (err) {
      return response.status(400).json({
        ok: false,
        ...err
      });
    }

    response.status(201).json({
      ok: true,
      body: usuarioSaved
    });
  });
});

module.exports = app;
