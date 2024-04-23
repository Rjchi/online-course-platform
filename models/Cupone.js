import mongoose, { Schema } from "mongoose";

const CuponeSchema = new Schema(
  {
    num_use: { type: Number, required: true },
    discount: { type: Number, required: true },
    state: { type: Number, required: true, default: 1 }, // 1 activo 2 inactivo
    code: { type: String, maxlength: 50, required: true },
    type_cupon: { type: Number, required: true, default: 1 }, // 1 es cuando el cupon es por curso y 2 por categoria
    type_count: { type: Number, required: true, default: 1 }, // ilimitado es 1 y limitado es 2
    type_discount: { type: Number, required: true, default: 1 }, // por porcentaje es 1 y 2 seria monto
    courses: [{ type: Object }], // almacenamos el id del curso [{_id:idDelCurso1}, {_id:idDelCurso2}...]
    categories: [{ type: Object }],
  },
  { timestamps: true }
);

const Cupone = mongoose.model("cupones", CuponeSchema);

export default Cupone;
