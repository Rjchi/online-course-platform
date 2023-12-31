import bcrypt from "bcryptjs";
import models from "../models";
import token from "../service/token";

export default {
  register: async (req, res) => {
    try {
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
        rol: "admin"
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
};
