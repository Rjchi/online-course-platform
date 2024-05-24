import routerx from "express-promise-router";

import auth from "../../service/auth";
import profileStudentController from "../../controllers/client/ProfileStudentController";

const router = routerx();

router.get("/list", [auth.verifyTienda], profileStudentController.profileStudent);

export default router;
