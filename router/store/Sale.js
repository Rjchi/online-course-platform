import routerx from "express-promise-router";

import auth from "../../service/auth.js";
import SaleController from "../../controllers/store/SaleController.js";

const router = routerx();

router
  .post("/register", [auth.verifyTienda], SaleController.register)
  .get("/send-email", [auth.verifyTienda], SaleController.send_mail)

export default router;
