import models from "../models";

export default {
  register: async (req, res) => {
    try {
      const IS_VALID_CUPONE = await models.Cupone.findOne({
        code: req.body.code,
      });

      if (IS_VALID_CUPONE)
        return res.status(200).json({
          message: 403,
          message_text: "EL CODIGO DEL CUPON YA EXISTE",
        });

      await models.Cupone.create(req.body);

      return res
        .status(200)
        .json({ message_text: "EL CUPON SE REGISTRO CORRECTAMENTE" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
  update: async (req, res) => {
    try {
      const IS_VALID_CUPONE = await models.Cupone.findOne({
        code: req.body.code,
        _id: { $ne: req.body._id },
      });

      if (IS_VALID_CUPONE)
        return res.status(200).json({
          message: 403,
          message_text: "EL CODIGO DEL CUPON YA EXISTE",
        });

      await models.Cupone.findByIdAndUpdate({ _id: req.body._id }, req.body);

      return res
        .status(200)
        .json({ message_text: "EL CUPÓN SE ACTUALIZÓ CORRECTAMENTE" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIÓ UN ERROR",
      });
    }
  },
  list: async (req, res) => {
    try {
      let search = req.query.search;

      let cupones = await models.Cupone.find({
        $or: [{ code: new RegExp(search, "i") }],
      }).sort({ createAt: -1 });

      return res.status(200).json({ cupones });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
  remove: async (req, res) => {
    try {
      let _id = req.params.id;
      await models.Cupone.findByIdAndDelete({ _id: _id });

      return res
        .status(200)
        .json({ msg: "EL CUPÓN SE A ELIMINADO CORRECTAMENTE" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
  config_all: async (req, res) => {
    try {
      let courses = await models.Course.find({ state: 2 }).populate(
        "categorie"
      );
      let categories = await models.Categorie.find({ state: 1 });

      courses = courses.map((course) => {
        return {
          _id: course._id,
          title: course.title,
          price_usd: course.price_usd,
          categorie: {
            _id: course.categorie._id,
            title: course.categorie.title,
          },
          image: course.image
            ? process.env.URL_BACKEND +
              "/api/courses/imagen-course/" +
              course.image
            : null,
        };
      });
      categories = categories.map((categorie) => {
        return {
          _id: categorie._id,
          title: categorie.title,
          imagen: categorie.imagen
            ? process.env.URL_BACKEND +
              "/api/categories/imagen-categorie/" +
              categorie.imagen
            : null,
        };
      });

      return res.status(200).json({ courses, categories });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
  showCupone: async (req, res) => {
    try {
      let cupone_id = req.params.id;

      let cupone = await models.Cupone.findOne({ _id: cupone_id });

      return res.status(200).json({ cupone });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
};
