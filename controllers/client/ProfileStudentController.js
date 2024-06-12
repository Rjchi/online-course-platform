import models from "../../models";
import token from "../../service/token";
import apiResource from "../../resource";

import bcrypt from "bcryptjs";

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

export default {
  profileStudent: async (req, res) => {
    try {
      let user = await token.decode(req.headers.token);

      let enrolled_course_count = await models.CourseStudent.countDocuments({
        user: user._id,
      });
      /**-----------------------------------------------------
       * | Cursos en los que se haya visto minimo una clase
       * -----------------------------------------------------*/
      let activated_course_count = await models.CourseStudent.countDocuments({
        user: user._id,
        clases_checked: {
          $ne: [], // diferente a vacio
        },
        state: 1,
      });

      let termined_course_count = await models.CourseStudent.countDocuments({
        user: user._id,
        state: 2,
      });

      let student = await models.User.findById({ _id: user._id });

      let actived_course_news = [];
      let termined_course_news = [];
      let enrolled_course_news = [];

      /**--------------------
       * | Enrolled course
       * --------------------*/
      let enrolled_course = await models.CourseStudent.find({
        user: user._id,
      });

      for (let e_course of enrolled_course) {
        let course = await models.Course.findOne({
          _id: e_course.course,
        }).populate(["categorie", "user"]);
        let Nclases = await numeroDeClases(course);

        enrolled_course_news.push({
          percentage: (
            (e_course.clases_checked.length / Nclases) *
            100
          ).toFixed(2), // redondeo de dos decimales
          clases_checked: e_course.clases_checked,
          course: apiResource.Course.apiResourceCourse(course, null, Nclases),
        });
      }

      /**------------------
       * | Actived Course
       * ------------------*/

      let actived_courses = await models.CourseStudent.find({
        user: user._id,
        clases_checked: {
          $ne: [], // diferente a vacio
        },
        state: 1,
      });

      for (let a_course of actived_courses) {
        let course = await models.Course.findOne({
          _id: a_course.course,
        }).populate(["categorie", "user"]);
        let Nclases = await numeroDeClases(course);

        actived_course_news.push({
          percentage: (
            (a_course.clases_checked.length / Nclases) *
            100
          ).toFixed(2), // redondeo de dos decimales
          clases_checked: a_course.clases_checked,
          course: apiResource.Course.apiResourceCourse(course, null, Nclases),
        });
      }

      /**--------------------
       * |Terminated Course
       * --------------------*/

      let terminated_courses = await models.CourseStudent.find({
        user: user._id,
        state: 2,
      });

      for (let t_course of terminated_courses) {
        let course = await models.Course.findOne({
          _id: t_course.course,
        }).populate(["categorie", "user"]);
        let Nclases = await numeroDeClases(course);

        termined_course_news.push({
          percentage: (
            (t_course.clases_checked.length / Nclases) *
            100
          ).toFixed(2), // redondeo de dos decimales
          clases_checked: t_course.clases_checked,
          course: apiResource.Course.apiResourceCourse(course, null, Nclases),
        });
      }

      /**------------------------------------------
       * | Compras relacionadas con el estudiante
       * ------------------------------------------*/
      let sales = await models.Sale.find({ user: user._id });
      let salesCollections = [];
      let salesDetailsCollections = [];

      for (let sale of sales) {
        sale = sale.toObject();

        let saleDetails = await models.SaleDetail.find({
          sale: sale._id,
        }).populate({
          path: "course",
          populate: {
            path: "categorie",
          },
        });

        let sales_detail_collection = [];

        for (let sale_d of saleDetails) {
          sale_d = sale_d.toObject();

          sales_detail_collection.push({
            total: sale_d.total,
            course: {
              _id: sale_d.course._id,
              title: sale_d.course.title,
              image: sale_d.course.image
                ? process.env.URL_BACKEND +
                  "/api/auth/imagen-usuario/" +
                  sale_d.course.image
                : null,
              categorie: sale_d.course.categorie,
            },
            discount: sale_d.discount,
            subtotal: sale_d.subtotal,
            price_unit: sale_d.price_unit,
            code_cupon: sale_d.code_cupon,
            type_discount: sale_d.type_discount,
            code_discount: sale_d.code_discount,
            campaing_discount: sale_d.campaing_discount,
          });

          let review = await models.Review.findOne({ sale_detail: sale_d._id });

          salesDetailsCollections.push({
            review: review,
            _id: sale_d._id,
            total: sale_d.total,
            course: {
              _id: sale_d.course._id,
              title: sale_d.course.title,
              image: sale_d.course.image
                ? process.env.URL_BACKEND +
                  "/api/auth/imagen-usuario/" +
                  sale_d.course.image
                : null,
              categorie: sale_d.course.categorie,
            },
            discount: sale_d.discount,
            subtotal: sale_d.subtotal,
            price_unit: sale_d.price_unit,
            code_cupon: sale_d.code_cupon,
            type_discount: sale_d.type_discount,
            code_discount: sale_d.code_discount,
            campaing_discount: sale_d.campaing_discount,
          });
        }

        salesCollections.push({
          _id: sale._id,
          total: sale.total,
          price_dolar: sale.price_dolar,
          n_transaction: sale.n_transaction,
          currency_total: sale.currency_total,
          method_payment: sale.method_payment,
          currency_payment: sale.currency_payment,
          date: sale.createdAt,
          sale_details: sales_detail_collection,
        });
      }

      return res.status(200).json({
        enrolled_course_count,
        termined_course_count,
        activated_course_count,
        profile: {
          name: student.name,
          email: student.email,
          phone: student.phone,
          surname: student.surname,
          birthday: student.birthday,
          profession: student.profession,
          description: student.description,
          avatar: student.avatar
            ? process.env.URL_BACKEND +
              "/api/auth/imagen-usuario/" +
              student.avatar
            : null,
        },
        sales: salesCollections,
        sales_details: salesDetailsCollections,
        actived_course_news: actived_course_news,
        termined_course_news: termined_course_news,
        enrolled_course_news: enrolled_course_news,
      });
    } catch (error) {
      return res.status(500).send({
        message_text: "OCURRIO UN ERROR",
      });
    }
  },
  updateStudent: async (req, res) => {
    try {
      const user = await token.decode(req.headers.token);

      const VALID_USER = await models.User.findOne({
        email: req.body.email,
        _id: { $ne: user._id },
      });

      if (VALID_USER)
        return res
          .status(200)
          .json({ message: 403, msg: "EL USUARIO INGRESADO YA EXISTE" });

      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }

      if (req.files && req.files.avatar) {
        const img_path = req.files.avatar.path;
        const avatar_name = img_path.split("\\")[2];

        req.body.avatar = avatar_name;
      }

      await models.User.findByIdAndUpdate({ _id: user._id }, req.body);

      const NUser = await models.User.findById({ _id: user._id });

      return res.status(200).json({
        msg: "EL USUARIO SE EDITO CORRECTAMENTE",
        user: apiResource.User.apiResourceUser(NUser),
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({
        msg: "OCURRIO UN PROBLEMA",
      });
    }
  },
  reviewUpdate: async (req, res) => {
    try {
      await models.Review.findByIdAndUpdate({ _id: req.body._id }, req.body);

      let review = await models.Review.findById({ _id: req.body._id });

      return res.status(200).json({
        message_text: "LA RESEÑA SE HA ACTUALIZADO CORRECTAMENTE",
        review: review,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message_text: "OCURRIO UN ERROR" });
    }
  },
  reviewRegister: async (req, res) => {
    try {
      let user = await token.decode(req.headers.token);

      req.body.user = user._id;
      let review = await models.Review.create(req.body);

      return res.status(200).json({
        message_text: "LA RESEÑA SE HA REGISTRADO CORRECTAMENTE",
        review: review,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message_text: "OCURRIO UN ERROR" });
    }
  },
  courseLeason: async (req, res) => {
    try {
      const slug = req.params.slug;
      const user = await token.decode(req.headers.token);

      const course = await models.Course.findOne({ slug });

      if (!course) {
        return res
          .status(200)
          .json({ message: 403, message_text: "EL CURSO NO EXISTE" });
      }

      const courseStudent = await models.CourseStudent.findOne({
        course: course._id,
        user: user._id,
      });

      if (!courseStudent) {
        return res.status(200).json({
          message: 403,
          message_text: "TU NO ESTAS INSCRITO EN ESTE CURSO",
        });
      }

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

      return res.status(200).json({
        course: apiResource.Course.apiResourceCourseLanding(
          course,
          null,
          mallaCurricular,
          timeTotalCourse,
          filesTotalSections,
          count_course_instructor
        ),
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message_text: "OCURRIO UN ERROR",
      });
    }
  },
};
