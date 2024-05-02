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

      return res.status(200).json({ categories: CATEGORIES_LIST });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
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
