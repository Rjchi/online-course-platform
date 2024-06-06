import fs from "fs";
import path from "path";
import models from "../../models";
import apiResource from "../../resource";

function sumarTiempos(...tiempos) {
  // Convierte cada tiempo en formato "hh:mm:ss" a segundos y suma todos los segundos.
  const totalSegundos = tiempos.reduce((total, tiempo) => {
    const [horas, minutos, segundos] = tiempo.split(":").map(Number);
    return total + horas * 3600 + minutos * 60 + segundos;
  }, 0);

  // Convierte los segundos totales a formato "hh:mm:ss".
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  // Retorna el resultado formateado.
  return `${horas} horas ${minutos} minutos ${segundos} segundos`;
}

function discountG(campaing_normal, course) {
  let discount_g = null;

  if (campaing_normal) {
    // 1 cursos
    if (campaing_normal.type_segment === 1) {
      let courses_a = [];

      campaing_normal.courses.forEach((course) => {
        courses_a.push(course);
      });

      if (courses_a.includes(course._id + "")) {
        return (discount_g = campaing_normal);
      }
    }
    // 2 categorias
    if (campaing_normal.type_segment === 2) {
      let categories_a = [];

      campaing_normal.categories.forEach((categorie) => {
        categories_a.push(categorie._id);
      });

      if (categories_a.includes(course.categorie._id + "")) {
        return (discount_g = campaing_normal);
      }
    }
  }
}

const numeroDeClases = async (course) => {
  let n_clases = 0;
  let sections = await models.CourseSection.find({ course: course._id });

  for (let section of sections) {
    let clases = await models.CourseClass.countDocuments({
      section: section._id,
    });

    n_clases += clases;
  }

  return n_clases;
};

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
        let n_clases = await numeroDeClases(course_top);

        COURSES_TOPS.push(
          apiResource.Course.apiResourceCourse(course_top, DISCONT_G, n_clases)
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

        let course_c = [];

        for (const course_map of courses) {
          let DISCONT_G = null;

          if (campaing_home) {
            // 1 cursos
            if (campaing_home.type_segment === 1) {
              let courses_a = [];

              campaing_home.courses.forEach((course) => {
                courses_a.push(course);
              });

              if (courses_a.includes(course_map._id + "")) {
                DISCONT_G = campaing_home;
              }
            }
            // 2 categorias
            if (campaing_home.type_segment === 2) {
              let categories_a = [];

              campaing_home.categories.forEach((categorie) => {
                categories_a.push(categorie._id);
              });

              if (categories_a.includes(course_map.categorie + "")) {
                DISCONT_G = campaing_home;
              }
            }
          }
          let n_clases = await numeroDeClases(course_map);

          course_c.push(
            apiResource.Course.apiResourceCourse(
              course_map,
              DISCONT_G,
              n_clases
            )
          );
        }

        CATEGORIES_SECTIONS.push({
          _id: categorie._id,
          title: categorie.title,
          title_empty: categorie.title.replace(" ", ""),
          count_courses: courses.length, // cantidad de cursos para la categoria
          courses: course_c,
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

          let n_clases = await numeroDeClases({ _id: course });

          COURSES_BANNER.push(
            apiResource.Course.apiResourceCourse(MODEL_COURSES, null, n_clases)
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

          let n_clases = await numeroDeClases({ _id: course });

          COURSES_FLASH.push(
            apiResource.Course.apiResourceCourse(MODEL_COURSES, null, n_clases)
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
  showCourse: async (req, res) => {
    try {
      let slug = req.params["slug"];
      let time_now = req.query.time_now;
      let campaing_special = req.query.campaing_special;

      let campaing_normal = null;

      if (campaing_special) {
        campaing_normal = await models.Discount.findOne({
          _id: campaing_special,
        });
      } else {
        campaing_normal = await models.Discount.findOne({
          type_campaing: 1,
          start_date_num: { $lte: time_now }, // time_now >= start_date_num
          end_date_num: { $gte: time_now }, // time_now <= end_date_num
        });
      }

      let course = await models.Course.findOne({ slug }).populate([
        "user",
        "categorie",
      ]);

      if (!course)
        return res
          .status(200)
          .json({ code: 404, message_text: "EL CURSO NO EXISTE" });

      let discount_g = null;
      let mallaCurricular = [];

      if (campaing_normal) {
        // 1 cursos
        if (campaing_normal.type_segment === 1) {
          let courses_a = [];

          campaing_normal.courses.forEach((course) => {
            courses_a.push(course);
          });

          if (courses_a.includes(course._id + "")) {
            discount_g = campaing_normal;
          }
        }
        // 2 categorias
        if (campaing_normal.type_segment === 2) {
          let categories_a = [];

          campaing_normal.categories.forEach((categorie) => {
            categories_a.push(categorie._id);
          });

          if (categories_a.includes(course.categorie._id + "")) {
            discount_g = campaing_normal;
          }
        }
      }

      /**-----------------------------------
       * | Todas las secciones del curso
       * -----------------------------------*/
      let sections = await models.CourseSection.find({ course: course._id });
      let timeTotalSections = [];
      let filesTotalSections = 0;

      for (let section of sections) {
        section = section.toObject(); // toObject para que me permita agregar nuevas propiedades

        /**--------------------------------------
         * | Traemos las clases de una sección
         * --------------------------------------*/
        let clasesSection = await models.CourseClass.find({
          section: section._id,
        });

        let clasesNew = [];
        let timeClases = [];

        for (let claseSection of clasesSection) {
          claseSection = claseSection.toObject();

          let ClaseFiles = await models.CourseClassFile.find({
            clase: claseSection._id,
          });

          claseSection.files = [];

          for (let ClaseFile of ClaseFiles) {
            claseSection.files.unshift({
              _id: ClaseFile._id,
              file:
                process.env.URL_BACKEND +
                "/api/course-class/file-class/" +
                ClaseFile.file,
              file_name: ClaseFile.file_name,
              size: ClaseFile.size,
              clase: ClaseFile.clase,
            });
          }

          filesTotalSections += claseSection.files.length;

          claseSection.vimeo_id = claseSection.vimeo_id
            ? process.env.VIMEO_URL + claseSection.vimeo_id
            : null;

          if (claseSection && claseSection.time) {
            let time_class = [claseSection.time];
            timeClases.push(claseSection.time);
            timeTotalSections.push(claseSection.time);

            const tiempoTotal = claseSection.time
              ? sumarTiempos(...time_class)
              : 0;

            claseSection.time_parse = tiempoTotal;
          }

          clasesNew.unshift(claseSection);
        }

        /**--------------------------------
         * | Adjuntamos la propiedad clases
         * --------------------------------*/
        section.clases = clasesNew;
        section.time_parse = sumarTiempos(...timeClases);
        mallaCurricular.push(section);
      }

      let timeTotalCourse = sumarTiempos(...timeTotalSections);
      let count_course_instructor = await models.Course.countDocuments({
        user: course.user._id,
        state: 2,
      });

      /**------------------------------------
       * | Curso aleatorio de un instructor
       * ------------------------------------*/
      let course_instructor = await models.Course.aggregate([
        {
          $match: {
            state: 2,
            user: course.user._id,
          },
        },
        {
          $sample: {
            size: 2,
          },
        },
        {
          $lookup: {
            from: "users", // nombre (en la base de datos) de la coleccion de la que viene la relación
            localField: "user", // nombre del campo en la coleccion
            foreignField: "_id", // cual es el campo en la coleccion que tiene relacion con el localField
            as: "user", // nombre que le vamos a dar al resultado de esta relacion
          },
        },
        {
          $unwind: "$user", // nombre que tiene la relación
        },
      ]);

      let n_course_instructor = [];

      for (const course_inst of course_instructor) {
        let discount_g = discountG(campaing_normal, course_inst);
        let n_clases = await numeroDeClases(course_inst);

        n_course_instructor.push(
          apiResource.Course.apiResourceCourse(
            course_inst,
            discount_g,
            n_clases
          )
        );
      }

      /**-------------------------------------------------
       * | Cuatro Cursos relacionados en base a la categoria
       * -------------------------------------------------*/
      let course_relateds = await models.Course.aggregate([
        {
          $match: {
            categorie: course.categorie._id,
            _id: {
              $ne: course._id,
            },
          },
        },
        {
          $sample: {
            size: 4,
          },
        },
        {
          $lookup: {
            from: "users", // nombre (en la base de datos) de la coleccion de la que viene la relación
            localField: "user", // nombre del campo en la coleccion
            foreignField: "_id", // cual es el campo en la coleccion que tiene relacion con el localField
            as: "user", // nombre que le vamos a dar al resultado de esta relacion
          },
        },
        {
          $unwind: "$user", // nombre que tiene la relación
        },
      ]);

      let n_course_relateds = [];

      for (const course_rel of course_relateds) {
        let discount_g = discountG(campaing_normal, course_rel);
        let n_clases = await numeroDeClases(course_rel);

        n_course_relateds.push(
          apiResource.Course.apiResourceCourse(course_rel, discount_g, n_clases)
        );
      }

      return res.status(200).json({
        course: apiResource.Course.apiResourceCourseLanding(
          course,
          discount_g,
          mallaCurricular,
          timeTotalCourse,
          filesTotalSections,
          count_course_instructor
        ),
        course_instructor: n_course_instructor,
        course_relateds: n_course_relateds,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        msg: "OCURRIO UN PROBLEMA",
      });
    }
  },
  search_course: async (req, res) => {
    try {
      let time_now = req.query.time_now;
      const searchCourse = req.body.search;

      let campaing_home = await models.Discount.findOne({
        type_campaing: 1,
        start_date_num: { $lte: time_now }, // time_now >= start_date_num
        end_date_num: { $gte: time_now }, // time_now <= end_date_num
      });

      const courses = await models.Course.aggregate([
        { $match: { state: 2, title: new RegExp(searchCourse, "i") } },
      ]);

      let listCourses = [];

      for (let course of courses) {
        let DISCONT_G = null;

        if (campaing_home) {
          // 1 cursos
          if (campaing_home.type_segment === 1) {
            let courses_a = [];

            campaing_home.courses.forEach((course) => {
              courses_a.push(course);
            });

            if (courses_a.includes(course._id + "")) {
              DISCONT_G = campaing_home;
            }
          }
          // 2 categorias
          if (campaing_home.type_segment === 2) {
            let categories_a = [];

            campaing_home.categories.forEach((categorie) => {
              categories_a.push(categorie._id);
            });

            if (categories_a.includes(course.categorie + "")) {
              DISCONT_G = campaing_home;
            }
          }
        }
        let n_clases = await numeroDeClases(course);

        listCourses.push(
          apiResource.Course.apiResourceCourse(course, DISCONT_G, n_clases)
        );
      }

      return res.status(200).json({
        courses: listCourses,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message_text: "OCURRIO UN ERROR",
      });
    }
  },
  configAll: async (req, res) => {
    try {
      let nCategories = [];
      let nInstructors = [];

      const instructores = await models.User.find({
        rol: "instructor",
        state: 1,
      });
      const categories = await models.Categorie.find({
        state: 1,
      });
      const levels = ["Basico", "Intermedio", "Avanzado"];
      const idiomas = ["Ingles", "Español", "Portugues", "Aleman"];

      /**-----------------------------------------
       * | Numero de cursos para una categoria
       * -----------------------------------------*/
      for (let categorie of categories) {
        categorie = categorie.toObject();
        categorie.count_courses = await models.Course.countDocuments({
          categorie: categorie._id,
        });

        nCategories.push(categorie);
      }

      /**-----------------------------------------
       * | Numero de cursos para un instructor
       * -----------------------------------------*/
      for (let instructor of instructores) {
        instructor = instructor.toObject();
        instructor.count_courses = await models.Course.countDocuments({
          user: instructor._id,
        });

        nInstructors.push(instructor);
      }

      return res.status(200).json({
        levels,
        idiomas,
        categories: nCategories,
        instructores: nInstructors,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message_text: "OCURRIO UN ERROR",
      });
    }
  },
};
