import routerx from "express-promise-router";

import auth from "../../service/auth.js";
import CartController from "../../controllers/store/CartController.js";

const router = routerx();

router
  .get("/list", [auth.verifyTienda], CartController.list)
  .put("/update", [auth.verifyTienda, path], CartController.update)
  .post("/register", [auth.verifyTienda, path], CartController.register)
  .delete("/remove/:id", [auth.verifyTienda], CartController.remove);

export default router;
