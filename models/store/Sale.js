import mongoose, { Schema } from "mongoose";

const SaleSchema = new Schema(
  {
    user:               { type: Schema.ObjectId, ref: "user", required: true },
    total:              { type: Number, required: true },
    method_payment:     { type: String, maxlength: 200, required: true },
    currency_total:     { type: String, default: "USD" },
    currency_payment:   { type: String, default: "USD" },
    price_dolar:        { type: Number, default: 3.66 },
    n_transaction:      { type: String, maxlength: 200, required: true },
  },
  { timestamps: true }
);

const Sale = mongoose.model("sale", SaleSchema);

export default Sale;
