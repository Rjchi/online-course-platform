import routerx from "express-promise-router";

/**----------------------------
 * | Panel de administración
 * ----------------------------*/
import User from "./User";
import Course from "./Course";
import Cupone from "./Cupone";
import Discount from "./Discount";
import Categorie from "./Categorie";
import CourseClass from "./CourseClass";
import CourseSection from "./CourseSection";

/**-----------
 * | Tienda
 * -----------*/
import Home from "./store/Home";

const router = routerx();

router
  .use("/auth", User)
  .use("/cupone", Cupone)
  .use("/courses", Course)
  .use("/discount", Discount)
  .use("/categories", Categorie)
  .use("/course-class", CourseClass)
  .use("/course-section", CourseSection)

  .use("/home", Home);

export default router;
