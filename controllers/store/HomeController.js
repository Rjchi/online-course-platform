import fs from "fs";
import path from "path";
import models from "../../models";
import apiResource from "../../resource";

export default {
  list: async (req, res) => {
    try {
      let time_now = req.query.time_now;

      /**--------------
       * | CATEGORIES
       * --------------*/
      let categories = await models.Categorie.find({ state: 1 });
      let CATEGORIES_LIST = [];

      for (let categorie of categories) {
        let count_courses = await models.Course.countDocuments({
          categorie: categorie._id,
        });

        CATEGORIES_LIST.push(
          apiResource.Categorie.apiResourceCategorie(categorie, count_courses)
        );
      }

      /**------------------
       * | CAMPAING NORMAL
       * ------------------*/
      let campaing_home = await models.Discount.findOne({
        type_campaing: 1,
        start_date_num: { $lte: time_now }, // time_now >= start_date_num
        end_date_num: { $gte: time_now }, // time_now <= end_date_num
      });

      /**------------------
       * | COURSES TOP
       * ------------------*/
      let COURSES_TOPS = [];

      /**------------------------------------------------------
       * | aggregate nos permite utilizar funciones avanzadas
       * | a diferencia de find, con sample le decimos cuantos
       * | registros queremos traer y match para la condicion
       * ------------------------------------------------------*/
      let courses_top = await models.Course.aggregate([
        { $match: { state: 2 } },
        { $sample: { size: 3 } },
        /**-------------------------------------------------------------------------
         * | Utilizamos $lookup ya que populate no se puede utilizar con aggregate
         * -------------------------------------------------------------------------*/
        {
          $lookup: {
            from: "users", // nombre (en la base de datos) de la coleccion de la que viene la relación
            localField: "user", // nombre del campo en la coleccion
            foreignField: "_id", // cual es el campo en la coleccion que tiene relacion con el localField
            as: "user", // nombre que le vamos a dar al resultado de esta relacion
          },
        },
        /**-----------------------------------------------------------------------------
         * | $unwind lo utilizamos en este caso para que el resultado no sea un array
         * | ya que solo tenemos un instructor por curso en caso de tener varios
         * | instructores podemos eliminar $unwind
         * -----------------------------------------------------------------------------*/
        {
          $unwind: "$user", // nombre que tiene la relación
        },
        {
          $lookup: {
            from: "categories",
            localField: "categorie",
            foreignField: "_id",
            as: "categorie",
          },
        },
        {
          $unwind: "$categorie",
        },
      ]);

      for (let course_top of courses_top) {
        let DISCONT_G = null;

        if (campaing_home) {
          // 1 cursos
          if (campaing_home.type_segment === 1) {
            let courses_a = [];

            campaing_home.courses.forEach((course) => {
              courses_a.push(course);
            });

            if (courses_a.includes(course_top._id + "")) {
              DISCONT_G = campaing_home;
            }
          }
          // 2 categorias
          if (campaing_home.type_segment === 2) {
            let categories_a = [];

            campaing_home.categories.forEach((categorie) => {
              categories_a.push(categorie._id);
            });

            if (categories_a.includes(course_top.categorie + "")) {
              DISCONT_G = campaing_home;
            }
          }
        }
        COURSES_TOPS.push(
          apiResource.Course.apiResourceCourse(course_top, DISCONT_G)
        );
      }

      let categories_sections = await models.Categorie.aggregate([
        { $match: { state: 1 } },
        {
          $sample: { size: 5 },
        },
      ]);

      /**-----------------------
       * | CATEGORIES SECTIONS
       * -----------------------*/
      let CATEGORIES_SECTIONS = [];

      for (const categorie of categories_sections) {
        let courses = await models.Course.find({
          categorie: categorie._id,
        }).populate(["categorie", "user"]);

        CATEGORIES_SECTIONS.push({
          _id: categorie._id,
          title: categorie.title,
          title_empty: categorie.title.replace(" ", ""),
          count_courses: courses.length, // cantidad de cursos para la categoria
          courses: courses.map((course) => {
            return apiResource.Course.apiResourceCourse(course);
          }),
        });
      }

      /**------------------
       * | CAMPAING BANNER
       * ------------------*/
      let campaing_baner = await models.Discount.findOne({
        type_campaing: 3,
        start_date_num: { $lte: time_now },
        end_date_num: { $gte: time_now },
      });

      let COURSES_BANNER = [];

      if (campaing_baner) {
        for (const course of campaing_baner.courses) {
          let MODEL_COURSES = await models.Course.findById({ _id: course });

          COURSES_BANNER.push(
            apiResource.Course.apiResourceCourse(MODEL_COURSES)
          );
        }
      }

      /**------------------
       * | CAMPAING FLASH
       * ------------------*/
      let campaing_flash = await models.Discount.findOne({
        type_campaing: 2,
        start_date_num: { $lte: time_now }, // time_now >= start_date_num
        end_date_num: { $gte: time_now }, // time_now <= end_date_num
      });

      let COURSES_FLASH = [];

      if (campaing_flash) {
        for (const course of campaing_flash.courses) {
          let MODEL_COURSES = await models.Course.findById({ _id: course });

          COURSES_FLASH.push(
            apiResource.Course.apiResourceCourse(MODEL_COURSES)
          );
        }
      }

      return res.status(200).json({
        categories: CATEGORIES_LIST,
        courses_top: COURSES_TOPS,
        courses_sections: CATEGORIES_SECTIONS,
        courses_banner: COURSES_BANNER,
        campaing_banner: campaing_baner,
        courses_flash: COURSES_FLASH,
        campaing_flash: campaing_flash,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
  getImage: async (req, res) => {
    try {
      const img = req.params["img"];

      if (!img) return res.status(500).json({ msg: "OCURRIO UN PROBLEMA" });

      /**----------------------------------------
       * | Valicamos si el archivo existe o no
       * | con stat de fs
       * ----------------------------------------*/
      fs.stat("./uploads/user/" + img, function (err) {
        if (!err) {
          let path_img = "./uploads/user/" + img;

          /**------------------------------------------------------------------
           * | Asi visualizamos desde la api la imagen que estamos almacenando
           * ------------------------------------------------------------------*/
          return res.status(200).sendFile(path.resolve(path_img));
        } else {
          /**----------------------------------------------------------
           * | En caso de error retornamos una imagen por defecto
           * ----------------------------------------------------------*/
          let path_img = "./uploads/default.jpg";

          return res.status(200).sendFile(path.resolve(path_img));
        }
      });
    } catch (error) {
      console.log(error.messge);
      return res.status(500).send({
        msg: "OCURRIO UN PROBLEMA",
      });
    }
  },
};
