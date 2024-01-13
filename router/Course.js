import routerx from "express-promise-router";

import auth from "../service/auth";
import courseController from "../controllers/CourseController";

const router = routerx();

router
  .post("/register", [auth.verifyAdmin], courseController.register)
  .put("/update", [auth.verifyAdmin], courseController.update)
  .get("/list", [auth.verifyAdmin], courseController.list)
  .delete("/remove/:id", [auth.verifyAdmin], courseController.remove)
  .get("/imagen-course/:img", courseController.getImage);

export default router;
