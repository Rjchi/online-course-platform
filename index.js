import path from "path";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import router from "./router";
import * as dotenv from "dotenv";

dotenv.config();

/**-------------------------------------------
 * | Conexión a la base de datos.
 * -------------------------------------------*/
mongoose.Promise = global.Promise; // Para utilizar de manera global las promesas de mongoose.

const uri = "mongodb://localhost:27017/courses";

mongoose
  .connect(uri)
  .then((mongoose) => console.log("CONECTADO A LA BASE DE DATOS PUERTO 27017"))
  .catch((err) =>
    console.log("ERROR AL CONECTARSE CON LA BASE DE DATOS: ", err)
  );

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/", router);
app.set("port", process.env.PORT || 3000);

app.listen(app.get("port"), () => {
  console.log(
    `El servidor se esta ejecutando en el puerto ${app.get("port")}`
  );
});
