var express = require("express");
var bcrypt = require("bcryptjs"); // DOC: https://www.npmjs.com/package/bcryptjs
var usuarioModel = require("../models/usuario");
// ========== *** Google Autenticacion ***
var CLIENT_GOOGLE_ID = require("../config/config").CLIENT_GOOGLE_ID;
var { OAuth2Client } = require("google-auth-library");
var client = new OAuth2Client(CLIENT_GOOGLE_ID);

// ========== ***  JWT Autenticacion***
var jwt = require("jsonwebtoken"); //  DOC: https://www.npmjs.com/package/jsonwebtoken
var SEED_SECRET = require("../config/config").SEED;

var app = new express();

// ========== *** Authenticación con Google ***
async function verify(token) {
  var ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_GOOGLE_ID
  });

  var payload = await ticket.getPayload();

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: payload.email_verified
  };
}

app.post("/google", async (request, response) => {
  var token = request.body.token;

  var errors;

  var googleUser = await verify(token).catch(reason => {
    errors = reason;
  });
  if (errors) {
    return response.status(403).json({ ok: false, message: "Token no válido", errors });
  }

  usuarioModel.findOne({ email: googleUser.email }, (errors, usuarioDBfound) => {
    if (errors) {
      return response
        .status(500)
        .json({ ok: false, mensaje: "Error al encontrar usuario", errors });
    }

    // si el usuario se encuentra en la base de datos
    if (usuarioDBfound) {
      //si ha sido autenticado por google enviarle un token
      if (usuarioDBfound.google) {
        var token = jwt.sign({ usuario: usuarioDBfound }, SEED_SECRET, { expiresIn: 3600 });

        response.status(200).json({
          ok: true,
          usuario: usuarioDBfound,
          token: token,
          id: usuarioDBfound._id
        });
        // sino significa que debe autenticarse por correo y contraseña
      } else {
        response.status(403).json({
          ok: false,
          mensaje: "El usuario debe autenticarse con correo y contraseña"
        });
      }
    } else {
      //Registrar al usuario sino se encuentra en la BD
      var nuevoUsuario = new usuarioModel();

      nuevoUsuario.nombre = googleUser.nombre;
      nuevoUsuario.email = googleUser.email;
      nuevoUsuario.img = googleUser.img;
      nuevoUsuario.google = googleUser.google;
      nuevoUsuario.password = "miclavepordefecto";

      nuevoUsuario.save((errors, usuarioSaved) => {
        if (errors) {
          return response.status(500).json({
            ok: false,
            mensaje: "No se ha podido registrar al usuario",
            errors
          });
        }
        var token = jwt.sign({ usuario: usuarioSaved }, SEED_SECRET, { expiresIn: 3600 });

        response.status(200).json({ ok: true, token, usuario: usuarioSaved });
      });
    }
  });
});

// ========== *** Autenticación normal ***
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
    if (!bcrypt.compareSync(body.password || "", usuarioFound.password)) {
      return response
        .status(400)
        .json({ ok: false, errors: { message: "Credenciales incorrectas - password" } });
    }
    // ========== *** Ocultar password ***
    usuarioFound.password = "Mipassswordsecret";

    // ========== *** Generar un token ***
    var token = jwt.sign({ usuario: usuarioFound }, SEED_SECRET, { expiresIn: 3600 });

    response
      .status(200)
      .json({ ok: true, usuario: usuarioFound, token: token, id: usuarioFound._id });
  });
});

module.exports = app;
