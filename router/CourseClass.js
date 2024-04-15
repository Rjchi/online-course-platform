import routerx from "express-promise-router";
import multiparty from "connect-multiparty";

import auth from "../service/auth";
import courseClassController from "../controllers/CourseClassController";

const router = routerx();

const path = multiparty({
  uploadDir: "./uploads/course",
});

const path1 = multiparty({
  uploadDir: "./uploads/course/files"
});

const path2 = multiparty();

router
  .get("/list", [auth.verifyAdmin], courseClassController.list)
  .put("/update", [auth.verifyAdmin], courseClassController.update)
  .post("/register", [auth.verifyAdmin], courseClassController.register)
  .delete("/remove/:id", [auth.verifyAdmin], courseClassController.remove)
  .post(
    "/upload-vimeo",
    [auth.verifyAdmin, path2],
    courseClassController.upload_vimeo
  )
  /**---------
   *  Files
   * ---------*/
  .post(
    "/register-file",
    [auth.verifyAdmin, path1],
    courseClassController.register_file
  )
  .delete(
    "/delete-file/:id",
    [auth.verifyAdmin],
    courseClassController.delete_file
  )
  .get("/file-image/:file", [auth.verifyAdmin], courseClassController.get_file_class)

export default router;
