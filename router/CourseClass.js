import routerx from "express-promise-router";

import auth from "../service/auth";
import courseClassController from "../controllers/CourseClassController";

const router = routerx();

const path = multiparty({
  uploadDir: "./uploads/course",
});

const path2 = multiparty();

router
  .get("/list", [auth.verifyAdmin], courseClassController.list)
  .put("/update", [auth.verifyAdmin], courseClassController.update)
  .post("/register", [auth.verifyAdmin], courseClassController.register)
  .delete("/remove/:id", [auth.verifyAdmin], courseClassController.remove)
  .post("/upload-vimeo", [auth.verifyAdmin, path2], courseClassController.upload_vimeo);

export default router;
