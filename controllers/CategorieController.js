import models from "../models";

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

      if (req.files && req.files.imagen) {
        const img_path = req.files.imagen.path;
        const imagen_name = img_path.split("\\")[2];

        req.body.imagen = imagen_name;
      }

      const NewCategorie = await models.Categorie.create(req.body);

      return res.status(200).json({
        categorie: NewCategorie,
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

      if (req.files && req.files.imagen) {
        const img_path = req.files.imagen.path;
        const imagen_name = img_path.split("\\")[2];

        req.body.imagen = imagen_name;
      }

      const EditCategorie = await models.Categorie.findByIdAndUpdate(
        { _id: req.body._id },
        req.body
      );

      return res.status(200).json({
        categorie: EditCategorie,
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
      const search = req.query.search;

      const CategorieList = await models.Categorie.find({
        $or: [{ title: new RegExp(search, "i") }],
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        categories: CategorieList,
      });
    } catch (error) {
      console.log(error.message);
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
};
