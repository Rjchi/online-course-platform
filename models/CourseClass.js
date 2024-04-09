import mongoose, { Schema } from "mongoose";

const CourseClassSchema = new Schema(
  {
    time: { type: String, required: true }, // Duración de la clase en 00:00:00
    vimeo_id: { type: String, required: true },
    description: { type: String, required: true },
    state: { type: Number, maxlength: 1, default: 1 }, // 1 es activo y 2 es inactivo
    title: { type: String, maxlength: 250, required: true },
    section: { type: Schema.ObjectId, ref: "course_section", required: true },
  },
  { timestamps: true }
);

const CourseClass = mongoose.model("course_class", CourseClassSchema);

export default CourseClass;
