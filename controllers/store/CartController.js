import models from "../../models";
import apiResource from "../../resource";
import useToken from "../../service/token";

export default {
  list: async (req, res) => {
    try {
      let token = req.headers.token;
      let user = await useToken.decode(token);

      let carts = await models.Cart.find({ user: user._id }).populate({
        path: "course",
        populate: {
          path: "categorie",
        },
      });

      carts = carts.map((cart) => {
        return apiResource.Cart.apiResourceCart(cart);
      });

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
      let user = await useToken.decode(req.headers.token);
      let cupon = await models.Cupone.findOne({ code: req.body.cupon });

      if (!cupon) {
        return res.status(200).json({
          message: 403,
          message_text: "EL CODIGO DEL CUPON NO EXISTE",
        });
      }

      let carts = await models.Cart.find({ user: user._id }).populate("course");
      let courses = [];
      let categories = [];

      cupon.categories.forEach((categorie) => {
        categories.push(categorie);
      });

      cupon.courses.forEach((course) => {
        courses.push(course);
      });

      for (let cart of carts) {
        if (courses.length > 0) {
          if (courses.includes(cart.course._id + "")) {
            let subtotal = 0;
            let total = 0;

            if (cupon.type_discount === 1) {
              subtotal =
                cart.price_unit - cart.price_unit * (cupon.discount * 0.01);
            } else {
              subtotal = cart.price_unit - cupon.discount;
            }

            total = subtotal;
            await models.Cart.findByIdAndUpdate(
              { _id: cart._id },
              {
                total: total,
                subtotal: subtotal,
                discount: cupon.discount,
                code_cupon: req.body.cupon,
                type_discount: cupon.type_discount,
                code_discount: null,
                campaing_discount: null,
              }
            );
          }
        }

        if (categories.length > 0) {
          if (categories.includes(cart.course.categorie._id + "")) {
            let subtotal = 0;
            let total = 0;

            if (cupon.type_discount === 1) {
              subtotal =
                cart.price_unit - cart.price_unit * (cupon.discount * 0.01);
            } else {
              subtotal = cart.price_unit - cupon.discount;
            }

            total = subtotal;
            await models.Cart.findByIdAndUpdate(
              { _id: cart._id },
              {
                total: total,
                subtotal: subtotal,
                discount: cupon.discount,
                code_cupon: req.body.cupon,
                type_discount: cupon.type_discount,
                code_discount: null,
                campaing_discount: null,
              }
            );
          }
        }
      }
      let newCarts = await models.Cart.find({ user: user._id }).populate({
        path: "course",
        populate: {
          path: "categorie",
        },
      });

      newCarts = newCarts.map((cart) => {
        return apiResource.Cart.apiResourceCart(cart);
      });

      return res.status(200).json({
        carts: newCarts,
        message: 200,
        message_text: "EL CUPÓN SE A APLICADO CORRECTAMENTE",
      });
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

      await models.Cart.deleteOne({ course: { _id: id } });

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
      let token = req.headers.token;
      let user = await useToken.decode(token);

      let cart_exit = await models.Cart.findOne({
        course: req.body.course._id,
        user: user._id,
      });

      if (cart_exit)
        return res.status(200).json({
          message: 403,
          message_text: "EL CURSO YA SE AGREGO A LA LISTA",
        });

      req.body.user = user._id;
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
