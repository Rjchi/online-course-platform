import routerx from "express-promise-router";
import userController from "../controllers/UserController";

const router = routerx();

router.post("/register", userController.register);

export default router;
