export default {
  apiResourceCategorie: (categorie) => {
    return {
      _id: categorie._id,
      title: categorie.title,
      image: categorie.image
        ? process.env.URL_BACKEND +
          "/api/categories/imagen-categorie/" +
          categorie.image
        : null,
      state: categorie.state,
    };
  },
};
