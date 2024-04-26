import models from "../models";

export default {
  register: async (req, res) => {
    try {
      let data = req.body;

      let filterA = []; // Para encontrar coincidencia a nivel de fecha de inicio
      let filterB = []; // Para encontrar coincidencia a nivel de fecha de fin

      if (data.type_segment === 1) {
        /**-----------------------------------------------------------------------------
         * | Para cursos: Filtrar en cursos existentes en otras campañas de descuento
         * -----------------------------------------------------------------------------*/
        filterA.push({
          /**-----------------------------------------------------------------------------------------------
           * | Con elemtMatch ingresamos al objeto y con el $in lo utilizamos para encontrar coincidencias
           * -----------------------------------------------------------------------------------------------*/
          courses: { $elemMatch: { _id: { $in: data.courses_s } } }, // o { $in: data.courses_s }
        });

        filterB.push({
          courses: { $elemMatch: { _id: { $in: data.courses_s } } },
        });
      } else {
        /**---------------------------------------------------------------------------------------
         * | Para categorias: Filtrar por categorias existentes en otras campañas de descuento
         * ---------------------------------------------------------------------------------------*/
        filterA.push({
          categories: { $elemMatch: { _id: { $in: data.categories_s } } },
        });

        filterB.push({
          categories: { $elemMatch: { _id: { $in: data.categories_s } } },
        });
      }

      /**-------------------------------------------------
       * | $gte este operador significa mayor o igual a
       * | y $lte significa menor o igual (operadores
       * | de MongoDB)
       -------------------------------------------------*/
      filterA.push({
        type_campaing: data.type_campaing,
        start_date_num: { $gte: data.start_date_num, $lte: data.end_date_num },
      });

      filterB.push({
        type_campaing: data.type_campaing,
        end_date_num: { $gte: data.start_date_num, $lte: data.end_date_num },
      });

      let exist_start_date = await models.Discount.findOne({
        $and: filterA,
      });

      let exist_end_date = await models.Discount.findOne({
        $and: filterB,
      });

      if (exist_start_date.length > 0 || exist_end_date.length > 0) {
        return res.status(200).json({
          message: 403,
          message_text:
            "EL DESCUENTO NO SE PUEDE REGISTRAR PORQUE HAY DUPLICIDAD",
        });
      }

      await models.Discount.create(data);

      return res.status(200).json({
        message: 200,
        message_text: "EL DESCUENTO SE REGISTRO CORRECTAMENTE",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
  update: async (req, res) => {
    try {
      const IS_VALID_DISCOUNT = await models.Discount.findOne({
        code: req.body.code,
        _id: { $ne: req.body._id },
      });

      if (IS_VALID_DISCOUNT)
        return res.status(200).json({
          message: 403,
          message_text: "EL CODIGO DEL CUPON YA EXISTE",
        });

      await models.Discount.findByIdAndUpdate({ _id: req.body._id }, req.body);

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
      let state = req.query.state;

      let filter = [{ code: new RegExp("", "i") }];

      if (search) {
        filter.push({ code: new RegExp(search, "i") });
      }

      if (state) {
        if (!search) {
          filter = [];
        }

        filter.push({ state: state });
      }

      let cupones = await models.Discount.find({
        $and: filter,
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
      await models.Discount.findByIdAndDelete({ _id: _id });

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
          image: categorie.image
            ? process.env.URL_BACKEND +
              "/api/categories/imagen-categorie/" +
              categorie.image
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

      let cupone = await models.Discount.findOne({ _id: cupone_id });

      return res.status(200).json({ cupone });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
};
