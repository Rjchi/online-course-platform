import routerx from "express-promise-router";

import auth from "../service/auth";
import cuponeController from "../controllers/CuponeController.js";

const router = routerx();

router
  .get("/list", [auth.verifyAdmin], cuponeController.list)
  .put("/update", [auth.verifyAdmin], cuponeController.update)
  .post("/register", [auth.verifyAdmin], cuponeController.register)
  .get("/show/:id", [auth.verifyAdmin], cuponeController.showCourse)
  .delete("/remove/:id", [auth.verifyAdmin], cuponeController.remove)
  .get("/config-all", [auth.verifyAdmin], cuponeController.config_all);

export default router;
