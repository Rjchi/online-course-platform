import routerx from "express-promise-router";

import User from "./User";
import Course from "./Course";
import Categorie from "./Categorie";
import CourseSection from "./CourseSection";

const router = routerx();

router
  .use("/auth", User)
  .use("/categories", Categorie)
  .use("/courses", Course)
  .use("/course-section", CourseSection);

export default router;
