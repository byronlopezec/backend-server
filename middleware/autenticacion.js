var SEED_SECRET = require("../config/config").SEED;
var jwt = require("jsonwebtoken");

exports.verificarToken = (request, response, next) => {
  var token = request.query.token;

  jwt.verify(token, SEED_SECRET, (errors, decoded) => {
    if (errors) {
      return response.status(401).json({ ok: false, mensaje: "Token no valido", errors });
    }
    request.usuarioToken = decoded.usuario;

    next();
  });
};
