import auth from "../service/auth";
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

  .get("/imagen-usuario/:img", userController.getImage)
  .get("/list", [auth.verifyAdmin], userController.list)
  .put("/update", [auth.verifyAdmin, path], userController.update)
  .delete("/delete/:id", [auth.verifyAdmin], userController.remove)
  .post("/register_admin", [auth.verifyAdmin, path], userController.register_admin);

export default router;
