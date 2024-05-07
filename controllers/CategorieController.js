import fs from "fs";
import path from "path";

import models from "../models";
import resource from "../resource";

export default {
  register: async (req, res) => {
    try {
      const VALID_CATEGORIE = await models.Categorie.findOne({
        title: req.body.title,
      });

      if (VALID_CATEGORIE) {
        return res.status(200).json({
          msg: 403,
          message_text: "LA CATEGORIA YA EXISTE",
        });
      }

      if (req.files && req.files.image) {
        const img_path = req.files.image.path;
        const imagen_name = img_path.split("\\")[2];

        req.body.image = imagen_name;
      }

      const NewCategorie = await models.Categorie.create(req.body);

      return res.status(200).json({
        categorie: resource.Categorie.apiResourceCategorie(NewCategorie),
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
      const VALID_CATEGORIE = await models.Categorie.findOne({
        title: req.body.title,
        _id: { $ne: req.body._id },
      });

      if (VALID_CATEGORIE) {
        return res.status(200).json({
          msg: 403,
          message_text: "LA CATEGORIA YA EXISTE",
        });
      }

      if (req.files && req.files.image) {
        const img_path = req.files.image.path;
        const imagen_name = img_path.split("\\")[2];

        req.body.image = imagen_name;
      }

      const EditCategorie = await models.Categorie.findByIdAndUpdate(
        { _id: req.body._id },
        req.body
      );

      const NEditCategorie = await models.Categorie.findById({
        _id: EditCategorie._id,
      });

      return res.status(200).json({
        categorie: resource.Categorie.apiResourceCategorie(NEditCategorie),
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
      const state = req.query.state;
      const search = req.query.search;

      let filter = [{ title: new RegExp("", "i") }];

      if (search) {
        filter = [{ title: new RegExp(search, "i") }];
      }

      if (state) {
        if (!search) {
          filter = [];
        }
        filter = [{ state: state }];
      }

      let CategorieList = await models.Categorie.find({
        $or: filter,
      }).sort({ createdAt: -1 });

      CategorieList = CategorieList.map((categorie) => {
        return resource.Categorie.apiResourceCategorie(categorie);
      });

      return res.status(200).json({
        categories: CategorieList,
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
      await models.Categorie.findByIdAndDelete({ _id: req.params["id"] });

      return res.status(200).json({
        msg: "LA CATEGORIA SE ELIMINO CORRECTAMENTE",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        msg: "HUBO UN ERROR",
      });
    }
  },
  getImage: async (req, res) => {
    try {
      const img = req.params["img"];

      if (!img) return res.status(500).json({ msg: "OCURRIO UN PROBLEMA" });

      fs.stat("./uploads/categorie/" + img, function (err) {
        if (!err) {
          let path_img = "./uploads/categorie/" + img;

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
