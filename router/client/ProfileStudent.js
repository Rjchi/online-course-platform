import routerx from "express-promise-router";

import auth from "../../service/auth";
import profileStudentController from "../../controllers/client/ProfileStudentController";

const router = routerx();

router
  .get("/client", [auth.verifyTienda], profileStudentController.profileStudent)
  .put("/update", [auth.verifyTienda], profileStudentController.updateStudent);

export default router;
