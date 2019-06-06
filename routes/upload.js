var express = require("express");
var fileUpload = require("express-fileupload");
var fileSystem = require("fs");

// ========== *** Modelos ***
var usuarioModel = require("../models/usuario");
var medicoModel = require("../models/medico");
var hospitalModel = require("../models/hospital");

var app = new express();
app.use(fileUpload());

app.put("/:tabla/:id", (request, response) => {
  var tabla = request.params.tabla.toLowerCase();
  var id = request.params.id;
  var tablasPermitidas = ["usuarios", "medicos", "hospitales"];

  if (!request.files) {
    return response.status(400).json({
      ok: false,
      message: "Ningún archivo seleccionado",
      errors: { message: "No ha seleccionado un archivo" }
    });
  }

  // ========== *** Si el path no es de mi coleccion ***
  if (tablasPermitidas.indexOf(tabla) < 0) {
    return response.status(400).json({
      ok: false,
      mensaje: "No existe Ningúna colección",
      errors: { message: "Las tablas permitdas son: " + tablasPermitidas }
    });
  }

  var archivo = request.files.imagen;
  var nombreCompleto = archivo.name.split(".");
  var extensionArchivo = nombreCompleto[nombreCompleto.length - 1];

  var extensionesPermitidas = ["png", "jpg", "jpeg", "gif"];

  if (extensionesPermitidas.indexOf(extensionArchivo) < 0)
    return response.status(400).json({
      ok: false,
      mensaje: "Extension no permitida",
      errors: { message: `Solo se permite las extensiones ${extensionesPermitidas.join(", ")}` }
    });

  // ========== *** Nombre del archivo diferente para cada usuario ***
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
  // ========== *** Path donde guardar el archivo ***
  var path = `./uploads/${tabla}/${nombreArchivo}`;

  archivo.mv(path, errors => {
    if (errors) {
      return response.status(400).json({ ok: false, mensaje: "Error al mover archivo", errors });
    }
    subirPorTabla(tabla, id, nombreArchivo, response);
  });
});

// ========== *** Funcion para guardar archivo por coleccion ***
function subirPorTabla(tabla, id, nombreArchivo, response) {
  var modelo;
  var nombreModelo;
  switch (tabla) {
    case "usuarios":
      modelo = usuarioModel;
      nombreModelo = "usuario";
      break;
    case "medicos":
      modelo = medicoModel;
      nombreModelo = "medico";
      break;
    case "hospitales":
      modelo = hospitalModel;
      nombreModelo = "hospital";
      break;

    default:
      break;
  }

  modelo
    .findById(id, "nombre email role img")
    .populate("usuario", "nombre email")
    .populate("hospital")
    .exec((errors, objeto) => {
      if (!objeto) {
        return response.status(400).json({
          ok: false,
          mensaje: `Ningún ${nombreModelo} con el _id ${id} encontrado`,
          errors
        });
      }

      // ========== *** Borrar anterior path de la imagen ***
      var pathViejo = `./uploads/${tabla}/${objeto.img}`;
      if (fileSystem.existsSync(pathViejo)) {
        fileSystem.unlinkSync(pathViejo);
      }

      // ========== *** guardo en objeto el nombre de la imagen ***
      objeto.img = nombreArchivo;

      objeto.save((errors, objetoSaved) => {
        if (errors) {
          return response
            .status(400)
            .json({ ok: false, mensaje: "Error al guardar imagen en " + nombreModelo, errors });
        }

        response.status(200).json({ ok: true, [nombreModelo]: objetoSaved });
      });
    });
}

module.exports = app;
