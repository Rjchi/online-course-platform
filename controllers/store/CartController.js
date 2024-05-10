import models from "../../models";
import useToken from "../../service/token";

export default {
  list: async (req, res) => {
    try {
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "OCURRIO UN ERROR",
      });
    }
  },
  update: async (req, res) => {
    try {
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "OCURRIO UN ERROR",
      });
    }
  },
  remove: async (req, res) => {
    try {
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "OCURRIO UN ERROR",
      });
    }
  },
  register: async (req, res) => {
    try {
      let cart_exit = await models.Cart.find({
        course: req.body.course,
        user: req.body.user,
      });

      if (cart_exit)
        return res.status(200).json({
          message: 403,
          message_text: "EL CURSO YA SE AGREGO A LA LISTA",
        });

      let NewCart = await models.Cart.create(req.body);

      return res.status(200).json({
        cart: NewCart,
        message_text: "EL CURSO SE AGREGO CORRECTAMENTE",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "OCURRIO UN ERROR",
      });
    }
  },
};
