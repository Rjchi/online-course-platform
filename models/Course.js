import mongoose, { Schema } from "mongoose";

const CourseSchema = new Schema(
  {
    state:          { type: Number, default: 1 }, // 1 es el curso en prueba o demo y 2 es el curso publico
    slug:           { type: String, required: true },
    subtitle:       { type: String, required: true },
    price_soles:    { type: Number, required: true },
    price_usd:      { type: Number, required: true },
    description:    { type: String, required: true },
    vimeo_id:       { type: String, required: false },
    level:          { type: String, required: true },
    idioma:         { type: String, required: true },
    requirements:   { type: String, required: true }, // ["", "", ""]
    who_is_it_for:  { type: String, required: true }, // ["", "", ""]
    title:          { type: String, maxlength: 250, required: true },
    image:          { type: Number, maxlength: 250, required: true },
    user:           { type: Schema.ObjectId, ref: "user", required: true }, // Relación con un usuario
    categorie:      { type: Schema.ObjectId, ref: "categorie", required: true }, // Relación con una categoria
  },
  { timestamps: true }
);

const Course = mongoose.model("course", CourseSchema);

export default Course;