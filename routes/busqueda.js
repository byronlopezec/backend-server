var express = require("express");
var hospitalModel = require("../models/hopital");
var usuarioModel = require("../models/usuario");
var medicoModel = require("../models/medico");

var app = new express();

// ========== *** Busqueda por coleccion ***

app.get("/coleccion/:tabla/:busqueda", (request, response) => {
  var tabla = request.params.tabla;
  var busqueda = request.params.busqueda;
  var regexBusqueda = new RegExp(busqueda, "i");

  var promesa;

  switch (tabla.toLowerCase()) {
    case "usuarios":
      promesa = buscarUsuarios(busqueda, regexBusqueda);
      break;
    case "medicos":
      promesa = buscarMedicos(busqueda, regexBusqueda);
      break;
    case "hospitales":
      promesa = buscarHospitales(busqueda, regexBusqueda);
      break;

    default:
      return response.status(400).json({
        ok: false,
        mensaje: "Solo se permite buscar tablas entre usuarios,medicos y hospitales",
        errors: { message: "Ninguna coleccion/tabla encontrada" }
      });
  }

  promesa.then(resultado => {
    response.status(200).json({
      ok: true,
      [tabla]: resultado
    });
  });
});

app.get("/toda/:busqueda", (request, response, next) => {
  var busqueda = request.params.busqueda;
  var regexBusqueda = new RegExp(busqueda, "i");

  Promise.all([
    buscarHospitales(busqueda, regexBusqueda),
    buscarMedicos(busqueda, regexBusqueda),
    buscarUsuarios(busqueda, regexBusqueda)
  ]).then(resultado => {
    response
      .status(200)
      .json({ ok: true, hospitales: resultado[0], medicos: resultado[1], usuarios: resultado[2] });
  });
});

function buscarHospitales(busqueda, regexBusqueda) {
  return new Promise((resolve, reject) => {
    hospitalModel
      .find({ nombre: regexBusqueda })
      .populate("usuario", "nombre email")
      .exec((err, hospitalesFound) => {
        if (err) {
          reject("Error al buscar hospitales", err);
        }

        resolve(hospitalesFound);
      });
  });
}

function buscarMedicos(busqueda, regexBusqueda) {
  return new Promise((resolve, reject) => {
    medicoModel
      .find({ nombre: regexBusqueda })
      .populate("usuario", "nombre email")
      .populate("hospital")
      .exec((err, medicosFound) => {
        if (err) {
          reject("Error al buscar medicos", err);
        }

        resolve(medicosFound);
      });
  });
}

function buscarUsuarios(busqueda, regexBusqueda) {
  return new Promise((resolve, reject) => {
    usuarioModel
      .find({}, "nombre email role")
      .or([{ nombre: regexBusqueda }, { email: regexBusqueda }])
      .exec((err, usuariosFound) => {
        if (err) {
          reject("Error al buscar Usuarios", err);
        }

        resolve(usuariosFound);
      });
  });
}

module.exports = app;
