import routerx from "express-promise-router";

import User from "./User";
import Categorie from "./Categorie";

const router = routerx();

router.use("/auth", User).use("/categories", Categorie);

export default router;
