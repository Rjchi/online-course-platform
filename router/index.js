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
import Cart from "./store/Cart";
import Sale from "./store/Sale";

/**------------
 * | Cliente
 * ------------*/
import ProfileStudent from "./client/ProfileStudent";

const router = routerx();

router
  .use("/auth", User)
  .use("/cupone", Cupone)
  .use("/courses", Course)
  .use("/discount", Discount)
  .use("/categories", Categorie)
  .use("/course-class", CourseClass)
  .use("/course-section", CourseSection)

  .use("/home", Home)
  .use("/cart", Cart)
  .use("/checkout", Sale)

  .use("/profile", ProfileStudent);

export default router;
