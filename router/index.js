import routerx from "express-promise-router";
import User from "./User";

const router = routerx();

router.use("/auth", User);

export default router;
