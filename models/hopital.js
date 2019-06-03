// Importar la libreria
var mongoose = require("mongoose");
// llamar a la clase Schema para definir un esquema de usuario
var Schema = mongoose.Schema;

// ========== *** definicion del Schema ***
var hospitalSchema = new Schema(
  {
    nombre: { type: String, required: [true, "El nombre es necesario"] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario" }
  },
  { collection: "hospitales" }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
