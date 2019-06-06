/* eslint-disable no-console */
// iniciar servidor Con nodemon: installarlo> npm install -g nodemon
// nodemon app.js
// eslint-disable-next-line no-unused-vars
var color = require("colors"); // http://voidcanvas.com/make-console-log-output-colorful-and-stylish-in-browser-node/
// ========== *** Importar librerias ***
var express = require("express");
var mongosse = require("mongoose");
var bodyParser = require("body-parser"); // ========== *** https://www.npmjs.com/package/body-parser ***

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
var appRoutes = require("./routes/app");
var loginRoutes = require("./routes/login");
var usuarioRoutes = require("./routes/usuario");
var hospitalRoutes = require("./routes/hospital");
var medicosRoutes = require("./routes/medico");
var busquedaRoutes = require("./routes/busqueda");
var uploadRoutes = require("./routes/upload");
var imagenRoutes = require("./routes/imagen");

// ========== *** Connect a mongoDB ***
mongosse.connect("mongodb://localhost:27017/hospitalDB", options, err => {
  if (err) throw err;
  console.log(
    "Conexion a la Database en el puerto\x1b[32m %s \x1b[0m%s".cyan,
    "27017".white,
    "online".yellow
  );
});

// ========== *** Server index para publicar carpetas y archivos disponbiles ***
// var serveIndex = require("serve-index");
// app.use(express.static(__dirname + "/"));
// app.use("/uploads", serveIndex(__dirname + "/uploads"));

// ========== *** RUTAS ***
app.use("/imagen", imagenRoutes);
app.use("/upload", uploadRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/medicos", medicosRoutes);
app.use("/hospitales", hospitalRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/login", loginRoutes);
app.use("/", appRoutes);

// ========== *** Escuchar Peticiones ***
app.listen(3000, "localhost", () => {
  console.log("Express Server puerto".cyan, "3000".white, "online".yellow);
});
