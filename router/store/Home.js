import routerx from "express-promise-router";
import homeController from "../../controllers/store/HomeController";

const router = routerx();

router
  .get("/list", homeController.list)
  .get("/imagen-usuario/:img", homeController.getImage)

export default router;
