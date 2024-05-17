import mongoose, { Schema } from "mongoose";

const SaleDetailSchema = new Schema(
  {
    sale:               { type: Schema.ObjectId, ref: "sale", required: true },
    total:              { type: Number, required: true },
    course:             { type: Schema.ObjectId, ref: "course", required: true },
    discount:           { type: Number, required: false },
    subtotal:           { type: Number, required: true },
    price_unit:         { type: Number, required: true },
    code_cupon:         { type: String, required: false },
    type_discount:      { type: Number, required: false }, // 1 es por porcentaje y 2 es por monto fijo
    code_discount:      { type: String, required: false },
    campaing_discount:  { type: Number, required: false },
  },
  { timestamps: true }
);

const SaleDetail = mongoose.model("sale_detail", SaleDetailSchema);

export default SaleDetail;
