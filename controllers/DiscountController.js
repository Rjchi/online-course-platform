import models from "../models";

export default {
  register: async (req, res) => {
    try {
      let data = req.body;
      console.log(data);

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
          courses: { $elemMatch: { $in: data.courses_s } }, // o { _id: { $in: data.categories_s } }
        });

        filterB.push({
          courses: { $elemMatch: { $in: data.courses_s } },
        });
      } else {
        /**---------------------------------------------------------------------------------------
         * | Para categorias: Filtrar por categorias existentes en otras campañas de descuento
         * ---------------------------------------------------------------------------------------*/
        filterA.push({
          categories: { $elemMatch: { $in: data.categories_s } },
        });

        filterB.push({
          categories: { $elemMatch: { $in: data.categories_s } },
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

      let exist_start_date = await models.Discount.find({
        $and: filterA,
      });

      let exist_end_date = await models.Discount.find({
        $and: filterB,
      });

      console.log(exist_end_date);
      console.log(exist_start_date);
      console.log("______________________________");
      console.log(filterA);
      console.log(filterB);

      if (exist_start_date && exist_end_date) {
        if (exist_start_date.length > 0 || exist_end_date.length > 0) {
          return res.status(200).json({
            message: 403,
            message_text:
              "EL DESCUENTO NO SE PUEDE REGISTRAR PORQUE HAY DUPLICIDAD",
          });
        }
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
      let data = req.body;

      let filterA = [];
      let filterB = [];

      if (data.type_segment === 1) {
        filterA.push({
          courses: { $elemMatch: { _id: { $in: data.courses_s } } },
        });

        filterB.push({
          courses: { $elemMatch: { _id: { $in: data.courses_s } } },
        });
      } else {
        filterA.push({
          categories: { $elemMatch: { _id: { $in: data.categories_s } } },
        });

        filterB.push({
          categories: { $elemMatch: { _id: { $in: data.categories_s } } },
        });
      }

      filterA.push({
        type_campaing: data.type_campaing,
        _id: { $ne: data._id },
        start_date_num: { $gte: data.start_date_num, $lte: data.end_date_num },
      });

      filterB.push({
        type_campaing: data.type_campaing,
        _id: { $ne: data._id },
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

      await models.Discount.findByIdAndUpdate({ _id: data._id }, data);

      return res.status(200).json({
        message: 200,
        message_text: "EL DESCUENTO SE EDITO CORRECTAMENTE",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIÓ UN ERROR",
      });
    }
  },
  list: async (req, res) => {
    try {
      let discounts = await models.Discount.find().sort({ createdAt: -1 });

      return res.status(200).json({ discounts });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
  remove: async (req, res) => {
    try {
      let discount_id = req.params.id;

      await models.Discount.findByIdAndDelete({ _id: discount_id });

      return res.status(200).json({
        message: "EL DESCUENTO SE HA ELIMINADO CORRECTAMENTE",
      });
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
  showDiscount: async (req, res) => {
    try {
      let discount_id = req.params.id;

      let discount = await models.Discount.findById({ _id: discount_id });

      return res.status(200).json({ discount });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
};
