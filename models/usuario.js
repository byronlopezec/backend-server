// Importar la libreria
var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
// llamar a la clase Schema para definir un esquema de usuario
var Schema = mongoose.Schema;

// ========== *** definicion del Schema ***
var usuarioSchema = new Schema({
  nombre: { type: String, required: [true, "El nombre es necesario"] },
  email: { type: String, unique: true, required: [true, "El correo es necesario"] },
  password: { type: String, required: [true, "La contraseña es necesaria"] },
  img: { type: String, required: false },
  role: {
    type: String,
    required: true,
    default: "USER_ROLE",
    enum: { values: ["ADMIN_ROLE", "USER_ROLE"], message: "{VALUE} no es un role permitido" }
  }
});
usuarioSchema.plugin(uniqueValidator, { message: "{PATH} ya existe" });

module.exports = mongoose.model("Usuario", usuarioSchema);
