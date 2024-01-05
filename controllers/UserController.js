import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

import models from "../models";
import resource from "../resource"; // Esto es para formatiar la data que vamos a enviar al cliente
import token from "../service/token";

export default {
  register: async (req, res) => {
    try {
      const VALID_USER = await models.User.findOne({ email: req.body.email });

      if (VALID_USER)
        return res
          .status(200)
          .json({ message: 403, msg: "EL USUARIO INGRESADO YA EXISTE" });

      req.body.password = await bcrypt.hash(req.body.password, 10);

      const User = await models.User.create(req.body);
      res.status(200).json({ user: User });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({
        msg: "OCURRIO UN PROBLEMA",
      });
    }
  },
  login: async (req, res) => {
    try {
      const user = await models.User.findOne({
        email: req.body.email,
        state: 1,
      });

      if (user) {
        let compare = await bcrypt.compare(req.body.password, user.password);

        if (compare) {
          let tokenT = await token.encode(user._id, user.rol, user.email);

          const USER_BODY = {
            token: tokenT,
            user: {
              name: user.name,
              surname: user.surname,
              email: user.email,
              // avatar: user.avatar
            },
          };

          return res.status(200).json({
            USER: USER_BODY,
          });
        } else {
          return res
            .status(404)
            .send({ msg: "EL USUARIO INGRESADO NO EXISTE" });
        }
      } else {
        return res.status(404).send({ msg: "EL USUARIO INGRESADO NO EXISTE" });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({
        msg: "HUBO UN ERROR",
      });
    }
  },
  login_admin: async (req, res) => {
    try {
      const user = await models.User.findOne({
        email: req.body.email,
        state: 1,
        rol: "admin",
      });

      if (user) {
        let compare = await bcrypt.compare(req.body.password, user.password);

        if (compare) {
          let tokenT = await token.encode(user._id, user.rol, user.email);

          const USER_BODY = {
            token: tokenT,
            user: {
              name: user.name,
              surname: user.surname,
              email: user.email,
              // avatar: user.avatar
            },
          };

          return res.status(200).json({
            USER: USER_BODY,
          });
        } else {
          return res
            .status(404)
            .send({ msg: "EL USUARIO INGRESADO NO EXISTE" });
        }
      } else {
        return res.status(404).send({ msg: "EL USUARIO INGRESADO NO EXISTE" });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({
        msg: "HUBO UN ERROR",
      });
    }
  },
  register_admin: async (req, res) => {
    try {
      const VALID_USER = await models.User.findOne({ email: req.body.email });

      if (VALID_USER)
        return res
          .status(200)
          .json({ message: 403, msg: "EL USUARIO INGRESADO YA EXISTE" });

      req.body.password = await bcrypt.hash(req.body.password, 10);

      if (req.files && req.files.avatar) {
        /**----------------------------------------------------------
         * | Tomamos el nombre de la ruta de donde se almacena
         * | el avatar
         * ----------------------------------------------------------*/
        const img_path = req.files.avatar.path;
        const avatar_name = img_path.split("\\")[2];

        req.body.avatar = avatar_name;
      }

      const User = await models.User.create(req.body);

      return res
        .status(200)
        .json({ user: resource.User.apiResourceUser(User) });
    } catch (error) {
      console.log(error.messge);
      return res.status(500).send({
        msg: "OCURRIO UN PROBLEMA",
      });
    }
  },
  getImage: async (req, res) => {
    try {
      const img = req.params["img"];

      if (!img) return res.status(500).json({ msg: "OCURRIO UN PROBLEMA" });

      /**----------------------------------------
       * | Valicamos si el archivo existe o no
       * | con stat de fs
       * ----------------------------------------*/
      fs.stat("./uploads/user/" + img, function (err) {
        if (!err) {
          let path_img = "./uploads/user/" + img;

          /**------------------------------------------------------------------
           * | Asi visualizamos desde la api la imagen que estamos almacenando
           * ------------------------------------------------------------------*/
          return res.status(200).sendFile(path.resolve(path_img));
        } else {
          /**----------------------------------------------------------
           * | En caso de error retornamos una imagen por defecto
           * ----------------------------------------------------------*/
          let path_img = "./uploads/default.png";

          return res.status(200).sendFile(path.resolve(path_img));
        }
      });
    } catch (error) {
      console.log(error.messge);
      return res.status(500).send({
        msg: "OCURRIO UN PROBLEMA",
      });
    }
  },
  update: async (req, res) => {
    try {
      const VALID_USER = await models.User.findOne({
        email: req.body.email,
        _id: { $ne: req.body._id },
      });

      if (VALID_USER)
        return res
          .status(200)
          .json({ message: 403, msg: "EL USUARIO INGRESADO YA EXISTE" });

      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }

      if (req.files && req.files.avatar) {
        const img_path = req.files.avatar.path;
        const avatar_name = img_path.split("\\")[2];

        req.body.avatar = avatar_name;
      }

      /**-----------------------------------------------------------
       * | Ubicamos el usuario en base al id y luego lo editamos
       * -----------------------------------------------------------*/
      await models.User.findByIdAndUpdate({ id: req.body._id }, req.body);

      /**--------------------------------------------------
       * | Aqui volvemos a hacer la busqueda del usuario
       * | Para que nos muestre la información actualizada
       * | No la que teniamos antes de actualizar
       * --------------------------------------------------*/
      const NUser = await models.User.findById({ _id: req.body._id });

      return res.status(200).json({
        msg: "EL USUARIO SE EDITO CORRECTAMENTE",
        user: resource.User.apiResourceUser(NUser),
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({
        msg: "OCURRIO UN PROBLEMA",
      });
    }
  },
  list: async (req, res) => {
    try {
      const search = req.query.search;

      let USERS = await models.User.find({
        $or: [
          { name: new RegExp(search, "i") }, // Generamos una expresión regular para que no distinga mayusculas de minusculas
          { surname: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
        ],

        /**-------------------------------------------------------------------
         * | Aqui filtramos los roles que queremos que sean listados
         * | En este caso solo queremos usuarios de rol admin y instructor
         * -------------------------------------------------------------------*/
        rol: { $in: ["admin", "instructor"] },
      }).sort({ createdAt: -1 }); // Ordenamos de manera decendente en base al campo createdAt

      /**----------------------------------------------------------------
       * | Iteramos los usuarios y les damos un formato individualmente
       * ----------------------------------------------------------------*/
      USERS = USERS.map((user) => {
        return resource.User.apiResourceUser(user);
      });

      return res.status(200).json({
        users: USERS,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({
        msg: "OCURRIO UN PROBLEMA",
      });
    }
  },
  remove: async (req, res) => {
    try {
      let _id = req.params["id"];

      await models.User.findByIdAndDelete({ _id });

      return res.status(200).json({
        msg: "EL USUARIO SE ELIMINO CORRECTAMENTE",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({
        msg: "OCURRIO UN PROBLEMA",
      });
    }
  },
};
