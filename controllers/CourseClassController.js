import models from "../models";

const TOKEN_VIMEO = "3ce863feebf2baf35c67169865ffac98";
const CLIENT_ID_VIMEO = "82b33558cedd8bec9194a326969935cd72fff59a";
const CLIENT_SECRET_VIMEO =
  "UBPxXdWxL0aKikElcI/utLlJkpbdSQ9bJxntal5CvndiK5uAxGi5Hxrnv11l4nSJXYWgWVxvC/6WsSZuIza76fRZGmhKjb/RMPJK04bluiqIYgruAmuF9HG71ZX63Ebq";

import { Vimeo } from "@vimeo/vimeo";

const CLIENT_VIMEO = new Vimeo(
  CLIENT_ID_VIMEO,
  CLIENT_SECRET_VIMEO,
  TOKEN_VIMEO
);

const UploadVideoVimeo = async (pathFile, video) => {
  return new Promise((resolve, reject) => {
    CLIENT_VIMEO.upload(
      pathFile,
      video,
      (url) => {
        resolve({
          message: 200,
          value: url,
        });
      },
      (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log("Progreso de subida: " + percentage + "%");
      },
      (err) => {
        console.log(err);
        reject({
          message: 403,
          message_text: "ERROR AL SUBIR EL VIDEO A VIMEO",
        });
      }
    );
  });
};

export default {
  register: async (req, res) => {
    try {
      const VALID_CLASS = await models.CourseClass.findOne({
        title: req.body.title,
        section: req.body.section,
      });

      if (VALID_CLASS) {
        return res.status(200).json({
          msg: 403,
          message_text: "LA CLASE YA EXISTE",
        });
      }

      const newClass = await models.CourseClass.create(req.body);

      return res.status(200).json({
        course_class: newClass,
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
      const VALID_CLASS = await models.CourseClass.findOne({
        title: req.body.title,
        section: req.body.section,
        _id: { $ne: req.body._id },
      });

      if (VALID_CLASS) {
        return res.status(200).json({
          msg: 403,
          message_text: "LA CLASE YA EXISTE",
        });
      }

      const EditCourseClass = await models.CourseClass.findByIdAndUpdate(
        { _id: req.body._id },
        req.body
      );

      const NEditCourseClass = await models.CourseClass.findById({
        _id: EditCourseClass._id,
      });

      return res.status(200).json({
        course_class: NEditCourseClass,
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
      let CoursesClass = await models.CourseClass.find().sort({
        createdAt: -1,
      });

      return res.status(200).json({
        course_class: CoursesClass,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "HUBO UN ERROR",
      });
    }
  },
  remove: async (req, res) => {
    try {
      await models.CourseClass.findByIdAndDelete({ _id: req.params["id"] });

      return res.status(200).json({
        msg: "LA CLASE SE ELIMINO CORRECTAMENTE",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        msg: "HUBO UN ERROR",
      });
    }
  },
  upload_vimeo: async (req, res) => {
    try {
      let PathFile = req.files.video.path;
      let VideoMetaData = {
        name: "video de prueba",
        description: "Esto es una descripcion",
        privacy: {
          view: "anybody",
        },
      };
      let vimeo_id_result = "";
      const result = await UploadVideoVimeo(PathFile, VideoMetaData);

      if (result.message === 403) {
        return res.status(500).json({
          msg: "OCURRIO UN ERROR",
        });
      } else {
        let ARRAY_VALUES = result.value.split("/");
        vimeo_id_result = ARRAY_VALUES[2];

        let Course = await models.Course.findByIdAndUpdate(
          { _id: req.body._id },
          { vimeo_id: vimeo_id_result }
        );

        return res.status(200).json({
          msg: "Prueba exitosa",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
};
