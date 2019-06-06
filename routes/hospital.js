var express = require("express");
var hospitalModel = require("../models/hospital");
var autenticacion = require("../middleware/autenticacion");

var app = new express();

// ========== *** Obtener lista de usuarios ***
app.get("/", (request, response) => {
  var desde = request.query.desde || 0;
  desde = Number(desde);

  var limit = request.query.limit || 0;
  limit = Number(limit);

  hospitalModel
    .find({}, "nombre usuario")
    .skip(desde)
    .limit(limit)
    .populate("usuario", "nombre email")
    .exec((err, res) => {
      if (err) {
        return response.status(500).json({
          ok: false,
          message: "Error cargando hospital",
          err
        });
      }

      hospitalModel.countDocuments({}, (err, count) => {
        response.status(200).json({
          hospitales: res,
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

  var hospital = new hospitalModel({ ...body, usuario: request.usuarioToken._id });

  hospital.save((err, hospitalSaved) => {
    if (err) {
      return response.status(400).json({ ok: false, ...err });
    }

    response
      .status(201)
      .json({ ok: true, hospital: hospitalSaved, usuarioToken: request.usuarioToken });
  });
});

// ========== *** Actualizar hospital ***
app.put("/:id", autenticacion.verificarToken, (request, response) => {
  var id = request.params.id;

  hospitalModel.findById(id, "nombre usuario", (err, hospitalFound) => {
    if (err) {
      return response
        .status(500)
        .json({ ok: false, message: "Error buscar hospital", errors: err });
    }

    if (!hospitalFound) {
      return response.status(400).json({ ok: false, errors: "Hospital no encontrado!" });
    }

    var body = request.body;
    hospitalFound.nombre = body.nombre;
    hospitalFound.usuario = request.usuarioToken._id;

    hospitalFound.save((err, hospitalSaved) => {
      if (err) {
        return response
          .status(400)
          .json({ ok: false, message: "Error al actualizar hospital", err });
      }
      var usuarioToken = request.usuarioToken;

      response.status(200).json({ ok: true, hospital: hospitalSaved, usuarioToken });
    });
  });
});

// ========== *** Borrar Hospital ***
app.delete("/:id", autenticacion.verificarToken, (request, response) => {
  var id = request.params.id;

  hospitalModel.findByIdAndDelete(id, (err, hopitalDelete) => {
    if (err) {
      return response.status(500).json({
        ok: false,
        mensaje: "Error al eliminar Hospital",
        errors: { message: "Error al eliminar Hospital" }
      });
    }

    if (!hopitalDelete) {
      return response.status(400).json({
        ok: false,
        mensaje: "Hospital no encontrado para eliminar",
        errors: { message: "Hospital no encontrado para eliminar" }
      });
    }

    var usuarioToken = request.usuarioToken;

    response.status(200).json({ ok: true, hospital: hopitalDelete, usuarioToken });
  });
});

module.exports = app;
