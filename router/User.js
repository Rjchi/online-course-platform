import multiparty from "connect-multiparty"; // (Middleware) Esta libreria para recepcionar la img, procesarla y almacenarla
import routerx from "express-promise-router";
import userController from "../controllers/UserController";

/**---------------------------------
 * | parametros: DONDE ALMACENAR
 * ---------------------------------*/
var path = multiparty({uploadDir: './uploads/user'})

const router = routerx();

router
  .post("/register", userController.register)
  .post("/login", userController.login)
  .post("/login_admin", userController.login_admin)

  .post("/update", path, userController.update)
  .post("/register_admin", path, userController.register_admin)
  .get("/imagen-usuario/:img", userController.getImage);

export default router;
