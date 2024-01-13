import multiparty from "connect-multiparty";
import routerx from "express-promise-router";

import auth from "../service/auth";
import courseController from "../controllers/CourseController";

const path = multiparty({
  uploadDir: "./uploads/course",
});

const router = routerx();

router
  .get("/imagen-course/:img", courseController.getImage)
  .get("/list", [auth.verifyAdmin], courseController.list)
  .put("/update", [auth.verifyAdmin, path], courseController.update)
  .delete("/remove/:id", [auth.verifyAdmin], courseController.remove)
  .post("/register", [auth.verifyAdmin, path], courseController.register);

export default router;
