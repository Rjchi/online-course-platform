import models from "../../models";
import apiResource from "../../resource";
import { decode } from "../../service/token";

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
      let user = await decode(req.headers.token);

      let enrolled_course_count = await models.CourseStudent.count({
        user: user._id,
      });
      /**-----------------------------------------------------
       * | Cursos en los que se haya visto minimo una clase
       * -----------------------------------------------------*/
      let activated_course_count = await models.CourseStudent.count({
        user: user._id,
        clases_checked: {
          $ne: [], // diferente a vacio
        },
        state: 1,
      });

      let termined_course_count = await models.CourseStudent.count({
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
        let course = await models.Course.findOne({ _id: e_course.course });
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
        });
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
        });
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

      return (
        res.status(200),
        json({
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
        })
      );
    } catch (error) {
      return res.status(500).send({
        message_text: "OCURRIO UN ERROR",
      });
    }
  },
};
