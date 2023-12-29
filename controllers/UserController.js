import models from "../models";

export default {
  register: async (req, res) => {
    try {
      const User = await models.User.create(req.body);
      res.status(200).json({ user: User });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({
        msg: "OCURRIO UN PROBLEMA",
      });
    }
  },
};
