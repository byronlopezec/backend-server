var express = require("express");
var medicoModel = require("../models/medico");
var bcrypt = require("bcryptjs"); // ========== *** https://www.npmjs.com/package/bcryptjs ***
var autenticacion = require("../middleware/autenticacion");

var app = new express();

// ========== *** Obtener lista de usuarios ***
app.get("/", (request, response, next) => {
  medicoModel.find({}, "nombre usuario medico").exec((err, res) => {
    if (err) {
      return response.status(500).json({
        ok: false,
        message: "Error cargando medico",
        err
      });
    }

    response.status(200).json({
      medicos: res
    });
  });
});

// ========== *** Middleware Token para peticiones POST,PUT y DELETE ***
/**
 * app.use se llama por por encima de las funciones
 * que necesitan verificar valides del token
 */
// app.use("/", (request, response, next) => {
//   var token = request.query.token;

//   jwt.verify(token, SEED_SECRET, (errors, responsePermited) => {
//     if (errors) {
//       response.status(401).json({ ok: false, mensaje: "Token no valido", errors });
//     }

//     next();
//   });
// });

// ========== *** Agregar nuevo usuario ***
app.post("/", autenticacion.verificarToken, (request, response, next) => {
  var body = request.body;

  var medico = new medicoModel({ ...body, usuario: request.usuarioToken._id });

  medico.save((err, medicoSaved) => {
    if (err) {
      return response.status(400).json({ ok: false, ...err });
    }

    response
      .status(201)
      .json({ ok: true, medico: medicoSaved, usuarioToken: request.usuarioToken });
  });
});

// ========== *** Actualizar medico ***
app.put("/:id", autenticacion.verificarToken, (request, response) => {
  var id = request.params.id;

  medicoModel.findById(id, "nombre usuario hospital", (err, medicoFound) => {
    if (err) {
      return response.status(500).json({ ok: false, message: "Error buscar medico", errors: err });
    }

    if (!medicoFound) {
      return response.status(400).json({ ok: false, errors: "Médico no encontrado!" });
    }

    var body = request.body;
    medicoFound.nombre = body.nombre;
    medicoFound.usuario = request.usuarioToken._id;
    medicoFound.hospital = body.hospital;

    medicoFound.save((err, medicoSaved) => {
      if (err) {
        return response.status(400).json({ ok: false, message: "Error al actualizar medico", err });
      }
      var usuarioToken = request.usuarioToken;

      response.status(200).json({ ok: true, medico: medicoSaved, usuarioToken });
    });
  });
});

// ========== *** Borrar medico ***
app.delete("/:id", autenticacion.verificarToken, (request, response) => {
  var id = request.params.id;

  medicoModel.findByIdAndDelete(id, (err, medicoDeleted) => {
    if (err) {
      return response.status(500).json({
        ok: false,
        mensaje: "Error al eliminar medico",
        errors: { message: "Error al eliminar medico" }
      });
    }

    if (!medicoDeleted) {
      return response.status(400).json({
        ok: false,
        mensaje: "medico no encontrado para eliminar",
        errors: { message: "medico no encontrado para eliminar" }
      });
    }

    var usuarioToken = request.usuarioToken;

    response.status(200).json({ ok: true, medico: medicoDeleted, usuarioToken });
  });
});

module.exports = app;
