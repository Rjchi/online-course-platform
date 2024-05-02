import fs from "fs";
import path from "path";
import models from "../../models";
import apiResource from "../../resource";

export default {
  register: async (req, res) => {
    try {
      const VALID_SECTION = await models.CourseSection.findOne({
        title: req.body.title,
        course: req.body.course,
      });

      if (VALID_SECTION) {
        return res.status(200).json({
          msg: 403,
          message_text: "LA SECCIÓN YA EXISTE",
        });
      }

      const newSection = await models.CourseSection.create(req.body);

      return res.status(200).json({
        section: newSection,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        msg: "HUBO UN ERROR",
      });
    }
  },
  update: async (req, res) => {
    try {
      const VALID_SECTION = await models.CourseSection.findOne({
        title: req.body.title,
        course: req.body.course,
        _id: { $ne: req.body._id },
      });

      if (VALID_SECTION) {
        return res.status(200).json({
          msg: 403,
          message_text: "LA SECCIÓN YA EXISTE",
        });
      }

      const EditCourseSection = await models.CourseSection.findByIdAndUpdate(
        { _id: req.body._id },
        req.body
      );

      const NEditCourseSection = await models.CourseSection.findById({
        _id: EditCourseSection._id,
      });

      return res.status(200).json({
        section: NEditCourseSection,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        msg: "HUBO UN ERROR",
      });
    }
  },
  list: async (req, res) => {
    try {
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
        COURSES_TOPS.push(apiResource.Course.apiResourceCourse(course_top));
      }

      let categories_sections = await models.Categorie.aggregate([
        { $match: { state: 1 } },
        {
          $sample: { size: 5 },
        },
      ]);

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

      return res.status(200).json({
        categories: CATEGORIES_LIST,
        courses_top: COURSES_TOPS,
        courses_sections: CATEGORIES_SECTIONS,
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
  remove: async (req, res) => {
    try {
      await models.CourseSection.findByIdAndDelete({ _id: req.params["id"] });

      return res.status(200).json({
        msg: "LA SECCIÓN SE ELIMINO CORRECTAMENTE",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        msg: "HUBO UN ERROR",
      });
    }
  },
};
