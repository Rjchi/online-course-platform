import mongoose, { Schema } from "mongoose";

const DiscountSchema = new Schema(
  {
    end_date: { type: Date, required: true },
    discount: { type: Number, required: true },
    start_date: { type: Date, required: true },
    end_date_num: { type: Number, required: true },
    start_date_num: { type: Number, required: true },
    state: { type: Number, required: true, default: 1 }, // 1 activo 2 inactivo
    type_segment: { type: Number, required: true, default: 1 }, // 1 es cuando el descuento es por curso y 2 por categoria
    type_campaing: { type: Number, required: true, default: 1 }, // 1 campaña normal, 2 flash y 3 campaña banner
    type_discount: { type: Number, required: true, default: 1 }, // por porcentaje es 1 y 2 seria monto
    courses: [{ type: Object }], // almacenamos el id del curso [{_id:idDelCurso1}, {_id:idDelCurso2}...]
    categories: [{ type: Object }],
  },
  { timestamps: true }
);

const Discount = mongoose.model("discount", DiscountSchema);

export default Discount;
