import multiparty from "connect-multiparty"; // (Middleware) Esta libreria para recepcionar la img, procesarla y almacenarla
import routerx from "express-promise-router";
import userController from "../controllers/UserController";

/**---------------------------------
 * | parametros: DONDE ALMACENAR
 * ---------------------------------*/
var path = multiparty({ uploadDir: "./uploads/user" });

const router = routerx();

router
  .post("/login", userController.login)
  .post("/register", userController.register)
  .post("/login_admin", userController.login_admin)

  .get("/list", userController.list)
  .put("/update", path, userController.update)
  .delete("/delete/:id", userController.remove)
  .get("/imagen-usuario/:img", userController.getImage)
  .post("/register_admin", path, userController.register_admin);

export default router;
