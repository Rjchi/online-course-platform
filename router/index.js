import routerx from "express-promise-router";

import User from "./User";
import Course from "./Course";
import Categorie from "./Categorie";

const router = routerx();

router.use("/auth", User).use("/categories", Categorie).use("/courses", Course);

export default router;
