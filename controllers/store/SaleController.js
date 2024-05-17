import models from "../../models";
import token from "../../service/token";

export default {
  register: async (req, res) => {
    try {
      let user = await token.decode(req.headers.token);
      req.body.user = user._id;

      let sale = await models.Sale.create(req.body);
      let carts = await models.Cart.find({ user: user._id });

      for (let cart of carts) {
        cart = cart.toObject();
        cart.sale = sale._id;

        await models.SaleDetail.create(cart);
        await models.CourseStudent.create({
          user: user._id,
          course: cart.course,
        });
        await models.Cart.findByIdAndDelete({ _id: cart._id });
      }
      // TODO: envio del email
      return res.status(200).json({
        message: 200,
        message_text: "LA ORDEN SE GENERO CORRECTAMENTE",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "OCURRIO UN ERROR",
      });
    }
  },
};
