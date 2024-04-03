import routerx from "express-promise-router";

import auth from "../service/auth";
import courseSectionController from "../controllers/CourseSectionController";

const router = routerx();

router
  .get("/list", [auth.verifyAdmin], courseSectionController.list)
  .put("/update", [auth.verifyAdmin], courseSectionController.update)
  .delete("/remove/:id", [auth.verifyAdmin], courseSectionController.remove)
  .post("/register", [auth.verifyAdmin], courseSectionController.register)

export default router;
