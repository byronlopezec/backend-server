var express = require("express");
var fileUpload = require("express-fileupload");

var app = new express();
app.use(fileUpload());

app.put("/:tabla/:id", (request, response) => {
  var tabla = request.params.tabla;
  var id = request.params.id;

  if (!request.files) {
    return response.status(400).json({ ok: false, message: "Ningún archivo seleccionado" });
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
      return response.status(400).json({ ok: false, mensaje: "", errors });
    }

    response.status(200).json({
      ok: true,
      message: "Archivo subido con éxito"
    });
  });
});

module.exports = app;
