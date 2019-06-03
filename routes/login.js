var express = require("express");
var bcrypt = require("bcryptjs");
var usuarioModel = require("../models/usuario");

var app = new express();

app.post("/", (request, response) => {
  var body = request.body;

  usuarioModel.findOne({ email: body.email }, (err, usuarioFound) => {
    if (err) {
      return response.status(500).json({ ok: false, ...err });
    }

    if (!usuarioFound) {
      return response
        .status(400)
        .json({ ok: false, errors: { message: "Credenciales incorrectas - email" } });
    }

    // ========== *** Validar password ***
    if (!bcrypt.compareSync(body.password, usuarioFound.password)) {
      response
        .status(400)
        .json({ ok: false, errors: { message: "Credenciales incorrectas - password" } });
    }

    response.status(200).json({ ok: true, token: "Usted tendria un token!!", body });
  });
});

module.exports = app;
