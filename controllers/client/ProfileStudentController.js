import { decode } from "../../service/token";
import models from "../../models";

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

      let enrolled_course = await models.CourseStudent.find({
        user: user._id,
        state: 2,
      });

      for (let e_course of enrolled_course) {
        let course = await models.Course.findOne({ _id: e_course.course });

        enrolled_course_news.push({

        })
      }
      // let actived_course = await models.CourseStudent.find({
      //   user: user._id,
      // });
      //   let termined_course = await models.CourseStudent.find({
      //     user: user._id,
      //     clases_checked: {
      //       $ne: [], // diferente a vacio
      //     },
      //     state: 1,
      //   });

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
          actived_course_news: [],
          termined_course_news: [],
          enrolled_course_news: [],
        })
      );
    } catch (error) {
      return res.status(500).send({
        message_text: "OCURRIO UN ERROR",
      });
    }
  },
};
