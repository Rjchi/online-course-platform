import mongoose, { Schema } from "mongoose";

const CourseClassFileSchema = new Schema(
  {
    file: { type: String, maxlength: 250, required: true },
    file_name: { type: String, maxlength: 250, required: true },
    size: { type: Number, required: true },
    clase: { type: Schema.ObjectId, ref: "course_class", required: true },
  },
  { timestamps: true }
);

const CourseClassFile = mongoose.model("course_class_files", CourseClassFileSchema);

export default CourseClassFile;
