var express = require("express");
var hospitalModel = require("../models/hopital");
var app = new express();

app.get("/toda/:busqueda", (request, response, next) => {
  var busqueda = request.params.busqueda;
  var regexBusqueda = new RegExp(busqueda, "i");

  buscarHospitales(busqueda, regexBusqueda).then(hospitalesFound => {
    response.status(200).json({ ok: true, hospitalesFound });
  });
});

function buscarHospitales(busqueda, regexBusqueda) {
  return new Promise((resolve, reject) => {
    hospitalModel.find({ nombre: regexBusqueda }, (err, hospitalesFound) => {
      if (err) {
        reject("Error al buscar hospitales", err);
      }
      resolve(hospitalesFound);
    });
  });
}

module.exports = app;
