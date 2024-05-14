import models from "../../models";
import apiResource from "../../resource";
import useToken from "../../service/token";

export default {
  list: async (req, res) => {
    try {
      let token = req.headers.token;
      let user = useToken.decode(token);

      let carts = await models.Cart.find({ user: user });

      return res.status(200).json({
        carts,
      });
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
      let id = req.params.id;

      await models.Cart.findByIdAndDelete({ _id: id });

      return res.status(200).json({
        message_text: "EL CURSO SE A ELIMINADO DEL CARRITO DE COMPRAS",
      });
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

      let Cart = await models.Cart.create(req.body);

      /**---------------------------------------------------------------
       * | consultamos los detalles de un curso y dentro de ese curso
       * | consultamos los detalles de la categoria (populate anidado)
       * ---------------------------------------------------------------*/
      let NewCart = await models.Cart.findById({ _id: Cart._id }).populate({
        path: "course", // nombre de la relación
        populate: {
          path: "categorie",
        },
      });

      return res.status(200).json({
        cart: apiResource.Cart.apiResourceCart(NewCart),
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
