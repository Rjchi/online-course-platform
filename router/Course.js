import multiparty from "connect-multiparty";
import routerx from "express-promise-router";

import auth from "../service/auth";
import courseController from "../controllers/CourseController";

const path = multiparty({
  uploadDir: "./uploads/course",
});

const path2 = multiparty();

const router = routerx();

router
  .get("/imagen-course/:img", courseController.getImage)
  .get("/list", [auth.verifyAdmin], courseController.list)
  .get("/show/:id", [auth.verifyAdmin], courseController.showCourse)
  .get("/config-all", [auth.verifyAdmin], courseController.config_all)
  .put("/update", [auth.verifyAdmin, path], courseController.update)
  .delete("/remove/:id", [auth.verifyAdmin], courseController.remove)
  .post("/register", [auth.verifyAdmin, path], courseController.register)
  .post("/upload-vimeo", [auth.verifyAdmin, path2], courseController.upload_vimeo);

export default router;
