import routerx from "express-promise-router";
import userController from "../controllers/UserController";

const router = routerx();

router
  .post("/register", userController.register)
  .post("/login", userController.login)
  .post("/login_admin", userController.login);

export default router;
