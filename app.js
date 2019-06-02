// Iniciar servidor
// node app

// iniciar servidor Con nodemon: installarlo> npm install -g nodemon
// nodemon app.js

// Requires
var express = require("express");
var mongosse = require("mongoose");

//Inicialiar variables
var app = new express();

// Importaciones rutas
var usuarioRoutes = require("./routes/usuario");
var appRoutes = require("./routes/app");

// Conexion a la base de datos
mongosse.connection.openUri("mongodb://localhost:27017/hospitalDB", (err, conn) => {
  if (err) throw error;
  console.log("Conexion con la base de datos en el puerto\x1b[32m %s \x1b[0m%s", "27017", "online");
});

// rutas
app.use("/usuarios", usuarioRoutes);
app.use("/", appRoutes);

// Escuchar peticiones
app.listen(3000, "localhost", () => {
  console.log("Express Server puerto\x1b[32m %s \x1b[0m%s", "3000", "online");
});
