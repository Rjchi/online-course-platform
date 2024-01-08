export default {
  apiResourceCategorie: (categorie) => {
    return {
      _id: categorie._id,
      title: categorie.rol,
      imagen: categorie.avatar
        ? process.env.URL_BACKEND +
          "/api/categories/imagen-categorie/" +
          categorie.imagen
        : null,
      state: categorie.state,
    };
  },
};
