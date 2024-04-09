import routerx from "express-promise-router";

import User from "./User";
import Course from "./Course";
import Categorie from "./Categorie";
import CourseClass from "./CourseClass";
import CourseSection from "./CourseSection";

const router = routerx();

router
  .use("/auth", User)
  .use("/courses", Course)
  .use("/categories", Categorie)
  .use("/course-class", CourseClass)
  .use("/course-section", CourseSection);

export default router;
