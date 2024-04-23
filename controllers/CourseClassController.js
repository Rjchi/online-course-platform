import fs from "fs";
import path from "path";
import getVideoDurationInSeconds from "get-video-duration";

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

function formatiarDuracion(durationInSeconds) {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.floor(durationInSeconds % 60);

  /**------------------------------------------------
   * | Le damos este formato 03:04:23 (00:00:00)
   * ------------------------------------------------*/

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

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
      let sectionId = req.query.section_id;

      let CoursesClass = await models.CourseClass.find({ section: sectionId }).sort({
        createdAt: -1,
      });

      let NewCoursesClass = [];

      for (let CourseClass of CoursesClass) {
        CourseClass = CourseClass.toObject();
        let ClaseFiles = await models.CourseClassFile.find({
          clase: CourseClass._id,
        });

        CourseClass.files = [];

        for (const ClaseFile of ClaseFiles) {
          CourseClass.files.unshift({
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

        CourseClass.vimeo_id = CourseClass.vimeo_id
          ? process.env.VIMEO_URL + CourseClass.vimeo_id
          : null;

        let time_class = [CourseClass.time];
        const tiempoTotal = CourseClass.time ? sumarTiempos(...time_class) : 0;

        CourseClass.time_parse = tiempoTotal;
        NewCoursesClass.unshift(CourseClass);
      }

      return res.status(200).json({
        course_class: NewCoursesClass,
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

      getVideoDurationInSeconds(PathFile).then(async (duration) => {
        console.log(duration);
        console.log(formatiarDuracion(duration));

        let DURATION = formatiarDuracion(duration);
        let VideoMetaData = {
          name: "video de la clase",
          description: "El video de la clase seleccionada",
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

          await models.CourseClass.findByIdAndUpdate(
            { _id: req.body._id },
            { vimeo_id: vimeo_id_result, time: DURATION }
          );

          return res.status(200).json({
            msg: "Prueba exitosa",
            vimeo_id: process.env.VIMEO_URL + vimeo_id_result,
          });
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
  register_file: async (req, res) => {
    try {
      if (req.files && req.files.recurso) {
        const img_path = req.files.recurso.path;
        const name = img_path.split("\\");
        const recurso_name = name[3];

        req.body.file = recurso_name;
      }
      const ClaseFile = await models.CourseClassFile.create(req.body);

      return res.status(200).json({
        file: {
          _id: ClaseFile._id,
          file:
            process.env.URL_BACKEND +
            "/api/course-class/file-class/" +
            ClaseFile.file,
          file_name: ClaseFile.file_name,
          size: ClaseFile.size,
          clase: ClaseFile.clase,
        },
        message: "SE HA REGISTRADO EL RECURSO DESCARGABLE",
      });
    } catch (error) {
      console.log(error.messge);
      return res.status(500).send({
        msg: "OCURRIO UN PROBLEMA",
      });
    }
  },
  delete_file: async (req, res) => {
    try {
      let file_id = req.params.id;
      await models.CourseClassFile.findByIdAndDelete({
        _id: file_id,
      });

      return res.status(200).json({
        message: "SE HA ELIMINADO EL RECURSO DESCARGABLE",
      });
    } catch (error) {
      console.log(error.messge);
      return res.status(500).send({
        msg: "OCURRIO UN PROBLEMA",
      });
    }
  },
  get_file_class: async (req, res) => {
    try {
      const fileT = req.params["file"];

      if (!fileT) return res.status(500).json({ msg: "OCURRIO UN PROBLEMA" });

      fs.stat("./uploads/course/files/" + fileT, function (err) {
        if (!err) {
          let path_img = "./uploads/course/files/" + fileT;

          return res.status(200).sendFile(path.resolve(path_img));
        } else {
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
