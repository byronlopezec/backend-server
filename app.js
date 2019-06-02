// iniciar servidor Con nodemon: installarlo> npm install -g nodemon
// nodemon app.js

// ========== *** Importar librerias ***
var express = require("express");
var mongosse = require("mongoose");
var bodyParser = require("body-parser");

// ========== *** iniciar variables ***
var app = new express();
//Opciones para mongodb.connect()
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false, // Don't build indexes
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// ========== *** Convertir body de mongoDB a JSON ***
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ========== *** Importar Rutas ***
var usuarioRoutes = require("./routes/usuario");
var appRoutes = require("./routes/app");

// ========== *** Connect a mongoDB ***
mongosse.connect("mongodb://localhost:27017/hospitalDB", options, (err, conn) => {
  if (err) throw error;
  console.log("Conexion con la base de datos en el puerto\x1b[32m %s \x1b[0m%s", "27017", "online");
});

// ========== *** RUTAS ***
app.use("/usuarios", usuarioRoutes);
app.use("/", appRoutes);

// ========== *** Escuchar Peticiones ***
app.listen(3000, "localhost", () => {
  console.log("Express Server puerto\x1b[32m %s \x1b[0m%s", "3000", "online");
});
