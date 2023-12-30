import jwt from "jsonwebtoken";
import models from "../models";

export default {
  encode: async (_id, rol, email) => {
    const token = jwt.sign(
      {
        _id,
        rol,
        email,
      },
      "courses_udemy",
      { expiresIn: "1d" }
    );

    return token;
  },
  decode: async (token) => {
    try {
      const { _id } = jwt.verify(token, "courses_udemy");
      const user = await models.User.findOne({ _id });

      if (user) return user;
      else return false;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  },
};
