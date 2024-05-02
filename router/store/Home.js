import routerx from "express-promise-router";
import homeController from "../../controllers/store/HomeController";

const router = routerx();

router
  .get("/list", homeController.list)
  .put("/update", homeController.update)
  .post("/register", homeController.register)
  .delete("/remove/:id", homeController.remove)
  .get("/imagen-usuario/:img", homeController.getImage)

export default router;
