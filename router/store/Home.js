import routerx from "express-promise-router";
import homeController from "../../controllers/store/HomeController";

const router = routerx();

router
  .get("/list", homeController.list)
  .put("/update", homeController.update)
  .delete("/remove/:id", homeController.remove)
  .post("/register", homeController.register)

export default router;
