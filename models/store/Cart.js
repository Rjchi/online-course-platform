import mongoose, { Schema } from "mongoose";

const CartSchema = new Schema(
  {
    user:               { type: Schema.ObjectId, ref: "user", required: true },
    total:              { type: String, required: true },
    course:             { type: Schema.ObjectId, ref: "course", required: true },
    discount:           { type: Number, required: false },
    subtotal:           { type: String, required: true },
    price_unit:         { type: String, required: true },
    code_cupon:         { type: String, required: false },
    type_discount:      { type: Number, required: false }, // 1 es por porcentaje y 2 es por monto fijo
    code_discount:      { type: String, required: false },
    campaing_discount:  { type: Number, required: true },
  },
  { timestamps: true }
);

const Cart = mongoose.model("cart", CartSchema);

export default Cart;
