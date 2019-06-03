// Importar la libreria
var mongoose = require("mongoose");
// llamar a la clase Schema para definir un esquema de usuario
var Schema = mongoose.Schema;

// ========== *** definicion del Schema ***
var medicoSchema = new Schema(
  {
    nombre: { type: String, required: [true, "El nombre es necesario"] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    hospital: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "El Id del hospital es obligatorio"]
    }
  },
  { collection: "medicos" }
);

module.exports = mongoose.model("Medico", medicoSchema);
