import routerx from "express-promise-router";

import auth from "../service/auth";
import multiparty from "connect-multiparty";
import categorieController from "../controllers/CategorieController";

const path = multiparty({
  uploadDir: "./uploads/categorie",
});

const router = routerx();

router
.get("/list", [auth.verifyAdmin], categorieController.list)
.put("/update", [auth.verifyAdmin, path], categorieController.update)
.delete("/remove/:id", [auth.verifyAdmin], categorieController.remove)
.post("/register", [auth.verifyAdmin, path], categorieController.register)

export default router;
