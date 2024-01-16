import fs from "fs";
import path from "path";

import models from "../models";
import resource from "../resource";

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

        req.body.imagen = imagen_name;
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
      const courses = await models.Course.find({
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
      const categories = await models.Categorie.find({ state: 1 });

      categories = categories.map((categorie) => {
        return {
          _id: categorie._id,
          title: categorie.title,
        };
      });

      const users = await models.User.find({ state: 1, rol: "instructor" });

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
};
