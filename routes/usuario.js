var express = require("express");
var usuarioModel = require("../models/usuario");
var bcrypt = require("bcryptjs"); // ========== *** https://www.npmjs.com/package/bcryptjs ***
var autenticacion = require("../middleware/autenticacion");

var app = new express();

// ========== *** Obtener lista de usuarios ***
app.get("/", (request, response) => {
  var desde = request.query.desde || 0; // si es undefined tomar 0 de valor
  desde = Number(desde);

  var limit = request.query.limit || 0;
  limit = Number(limit);

  usuarioModel
    .find({}, "nombre email img role")
    .skip(desde)
    .limit(limit)
    .exec((err, res) => {
      if (err) {
        return response.status(500).json({
          ok: false,
          message: "Error cargando usuario",
          err
        });
      }

      // ========== *** collection.count() deprecated , contar total registros de la tabla ***
      usuarioModel.countDocuments({}, (err, count) => {
        response.status(200).json({
          usuarios: res,
          total: count
        });
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
app.post("/", autenticacion.verificarToken, (request, response) => {
  var body = request.body;
  // TODO: Validar password undefined!!!
  var usuario = new usuarioModel({ ...body, password: bcrypt.hashSync(body.password || "", 10) });

  usuario.save((err, usuarioSaved) => {
    if (err) {
      return response.status(400).json({ ok: false, ...err });
    }
    usuarioSaved.password = "Mipassswordsecret";

    response
      .status(201)
      .json({ ok: true, usuario: usuarioSaved, usuarioToken: request.usuarioToken });
  });
});

// ========== *** Actualizar usuario ***
app.put("/:id", autenticacion.verificarToken, (request, response) => {
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
      var usuarioToken = request.usuarioToken;

      response.status(200).json({ ok: true, body: usuarioGuardado, usuarioToken });
    });
  });
});

// ========== *** Borrar usuario ***
app.delete("/:id", autenticacion.verificarToken, (request, response) => {
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

    var usuarioToken = request.usuarioToken;

    response.status(200).json({ ok: true, usuario: usuarioBorrado, usuarioToken });
  });
});

module.exports = app;
