import fs from "fs";
import path from "path";

import models from "../models";
import resource from "../resource";

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
  /**----------------------------------------------------------
   * | parametros: CUANDO SE SOLUCIONA, CUANDO HAY UN PROBLEMA
   * ----------------------------------------------------------*/
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
      const IS_VALID_COURSE = await models.Course.findOne({
        title: req.body.title,
      });

      if (IS_VALID_COURSE)
        return res.status(200).json({
          message: 403,
          message_text: "EL CURSO INGRESADO YA EXISTE, INTENTE CON OTRO TITULO",
        });

      /**--------------------------------------
       * | Con esto sluguificamos el titulo
       * --------------------------------------*/
      req.body.slug = req.body.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

      if (req.files && req.files.portada) {
        const img_path = req.files.portada.path;
        const imagen_name = img_path.split("\\")[2];

        req.body.image = imagen_name;
      }

      const NewCourse = await models.Course.create(req.body);

      return res.status(200).json({
        msg: "EL CURSO SE REGISTRO CORRECTAMENTE",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
  update: async (req, res) => {
    try {
      const IS_VALID_COURSE = await models.Course.findOne({
        title: req.body.title,
        _id: { $ne: req.body._id },
      });

      if (IS_VALID_COURSE)
        return res.status(200).json({
          message: 403,
          message_text: "EL CURSO INGRESADO YA EXISTE, INTENTE CON OTRO TITULO",
        });

      /**--------------------------------------
       * | Con esto sluguificamos el titulo
       * --------------------------------------*/
      req.body.slug = req.body.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

      if (req.files && req.files.portada) {
        const img_path = req.files.portada.path;
        const imagen_name = img_path.split("\\")[2];

        req.body.imagen = imagen_name;
      }

      const EditCourse = await models.Course.findByIdAndUpdate(
        { _id: req.body._id },
        req.body
      );

      return res.status(200).json({
        msg: "EL CURSO SE EDITO CORRECTAMENTE",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
  list: async (req, res) => {
    try {
      /**---------------------------------------------------------
       * | Con populate podemos traer la categoria y el usuario
       * | ya que son los que estan relacionados con un curso
       * ---------------------------------------------------------*/
      let courses = await models.Course.find({
        $and: [{ title: new RegExp(req.query.search, "i") }],
      }).populate(["categorie", "user"]);

      courses = courses.map((course) => {
        return resource.Course.apiResourceCourse(course);
      });

      return res.status(200).json({
        courses,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
  remove: async (req, res) => {
    try {
      /**---------------------------------------------------------------------
       * | Si el curso esta relacionado con una venta no se puede eliminar
       * ---------------------------------------------------------------------*/
      await models.Course.findByIdAndDelete({
        _id: req.params["id"],
      });

      return res.status(200).json({
        msg: "EL CURSO SE ELIMINO CORRECTAMENTE",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
  config_all: async (req, res) => {
    try {
      /**-----------------------------------------
       * | Traemos solo las categorias activas
       * -----------------------------------------*/
      let categories = await models.Categorie.find({ state: 1 });

      categories = categories.map((categorie) => {
        return {
          _id: categorie._id,
          title: categorie.title,
        };
      });

      let users = await models.User.find({ state: 1, rol: "instructor" });

      users = users.map((user) => {
        return {
          _id: user._id,
          name: user.name,
          surname: user.surname,
        };
      });

      return res.status(200).json({
        categories,
        users,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
      });
    }
  },
  showCourse: async (req, res) => {
    try {
      let Course = await models.Course.findById({ _id: req.params["id"] });

      return res.status(200).json({
        course: resource.Course.apiResourceCourse(Course),
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

      fs.stat("./uploads/course/" + img, function (err) {
        if (!err) {
          let path_img = "./uploads/course/" + img;

          return res.status(200).sendFile(path.resolve(path_img));
        } else {
          let path_img = "./uploads/default.jpg";

          return res.status(200).sendFile(path.resolve(path_img));
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "OCURRIO UN ERROR",
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
        /**---------------------------------------------------
         * | ID que genera vimeo cuando subimos un video
         * | fomato de la URL: /videos/930335455
         * ---------------------------------------------------*/
        let ARRAY_VALUES = result.value.split("/");
        vimeo_id_result = ARRAY_VALUES[2];

        /**-------------------------------------
         * | Relacionamos el video con el curso
         * -------------------------------------*/
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
