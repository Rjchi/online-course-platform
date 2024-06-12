import multiparty from "connect-multiparty";
import routerx from "express-promise-router";

import auth from "../../service/auth";
import profileStudentController from "../../controllers/client/ProfileStudentController";

var path = multiparty({ uploadDir: "./uploads/user" });

const router = routerx();

router
  .get("/client", [auth.verifyTienda], profileStudentController.profileStudent)
  .get(
    "/course/:slug",
    [auth.verifyTienda],
    profileStudentController.courseLeason
  )
  .put(
    "/update",
    [auth.verifyTienda, path],
    profileStudentController.updateStudent
  )
  .post(
    "/course-student",
    [auth.verifyTienda, path],
    profileStudentController.courseStudent
  )
  .put(
    "/review-update",
    [auth.verifyTienda],
    profileStudentController.reviewUpdate
  )
  .post(
    "/review-register",
    [auth.verifyTienda],
    profileStudentController.reviewRegister
  );

export default router;
