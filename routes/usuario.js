var express = require("express");
var usuarioModel = require("../models/usuario");
var bcrypt = require("bcryptjs"); // ========== *** https://www.npmjs.com/package/bcryptjs ***

var jwt = require("jsonwebtoken"); //  DOC: https://www.npmjs.com/package/jsonwebtoken
var SEED_SECRET = require("../config/config").SEED;

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

// ========== *** Middleware Token para peticiones POST,PUT y DELETE ***
app.use("/", (request, response, next) => {
  var token = request.query.token;

  jwt.verify(token, SEED_SECRET, (errors, responsePermited) => {
    if (errors) {
      response.status(401).json({ ok: false, mensaje: "Token no valido", errors });
    }

    next();
  });
});

// ========== *** Agregar nuevo usuario ***
app.post("/", (request, response, next) => {
  var body = request.body;
  // TODO: Validar password undefined!!!
  var usuario = new usuarioModel({ ...body, password: bcrypt.hashSync(body.password, 10) });

  usuario.save((err, usuarioSaved) => {
    if (err) {
      return response.status(400).json({ ok: false, ...err });
    }

    response.status(201).json({ ok: true, body: usuarioSaved });
  });
});

// ========== *** Actualizar usuario ***
app.put("/:id", (request, response) => {
  var id = request.params.id;

  usuarioModel.findById(id, "nombre email role", (err, usuarioFound) => {
    if (err) {
      return response.status(500).json({ ok: false, message: "Error buscar usuario", errors: err });
    }

    if (!usuarioFound) {
      return response.status(400).json({ ok: false, errors: "Usuario no encontrado!" });
    }

    var body = request.body;
    usuarioFound.nombre = body.nombre;
    usuarioFound.email = body.email;
    usuarioFound.role = body.role;

    usuarioFound.save((err, usuarioGuardado) => {
      if (err) {
        return response
          .status(400)
          .json({ ok: false, message: "Error al actualizar usuario", err });
      }

      response.status(200).json({ ok: true, body: usuarioGuardado });
    });
  });
});

// ========== *** Borrar usuario ***
app.delete("/:id", (request, response) => {
  var id = request.params.id;

  usuarioModel.findByIdAndDelete(id, (err, usuarioBorrado) => {
    if (err) {
      return response.status(500).json({
        ok: false,
        mensaje: "Error al eliminar usuario",
        errors: { message: "Error al eliminar usuario" }
      });
    }

    if (!usuarioBorrado) {
      return response.status(400).json({
        ok: false,
        mensaje: "Usuario no encontrado para eliminar",
        errors: { message: "Usuario no encontrado para eliminar" }
      });
    }

    response.status(200).json({ ok: true, usuario: usuarioBorrado });
  });
});

module.exports = app;
