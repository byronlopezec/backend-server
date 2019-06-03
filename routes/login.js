var express = require("express");
var bcrypt = require("bcryptjs"); // DOC: https://www.npmjs.com/package/bcryptjs
var usuarioModel = require("../models/usuario");

var jwt = require("jsonwebtoken"); //  DOC: https://www.npmjs.com/package/jsonwebtoken
var SEED_SECRET = require("../config/config").SEED;

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

    // ========== *** Generar un token ***

    var token = jwt.sign({ usuario: usuarioFound }, SEED_SECRET, { expiresIn: 3600 });

    response
      .status(200)
      .json({ ok: true, usuario: usuarioFound, token: token, id: usuarioFound._id });
  });
});

module.exports = app;
