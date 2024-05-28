import multiparty from "connect-multiparty";
import routerx from "express-promise-router";

import auth from "../../service/auth";
import profileStudentController from "../../controllers/client/ProfileStudentController";

var path = multiparty({ uploadDir: "./uploads/user" });

const router = routerx();

router
  .get("/client", [auth.verifyTienda], profileStudentController.profileStudent)
  .put("/update", [auth.verifyTienda, path], profileStudentController.updateStudent);

export default router;
