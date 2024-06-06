import routerx from "express-promise-router";
import homeController from "../../controllers/store/HomeController";

const router = routerx();

router
  .get("/list", homeController.list)
  .post("/search-course", homeController.search_course)
  .get("/imagen-usuario/:img", homeController.getImage)
  .get("/landig-course/:slug", homeController.showCourse)

export default router;
