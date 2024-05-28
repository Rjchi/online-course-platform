import models from "../../models";
import apiResource from "../../resource";
import token from "../../service/token";

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
        }

        salesCollections.push({
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
        actived_course_news: actived_course_news,
        termined_course_news: termined_course_news,
        enrolled_course_news: enrolled_course_news,
        sales: salesCollections,
      });
    } catch (error) {
      return res.status(500).send({
        message_text: "OCURRIO UN ERROR",
      });
    }
  },
};
