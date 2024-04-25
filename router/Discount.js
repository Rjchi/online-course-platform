import routerx from "express-promise-router";

import auth from "../service/auth";
import discountController from "../controllers/DiscountController.js";

const router = routerx();

router
  .get("/list", [auth.verifyAdmin], discountController.list)
  .put("/update", [auth.verifyAdmin], discountController.update)
  .post("/register", [auth.verifyAdmin], discountController.register)
  .get("/show/:id", [auth.verifyAdmin], discountController.showCupone)
  .delete("/remove/:id", [auth.verifyAdmin], discountController.remove)
  .get("/config-all", [auth.verifyAdmin], discountController.config_all);

export default router;
