export default {
  apiResourceCategorie: (categorie, count_courses=0) => {
    return {
      _id: categorie._id,
      title: categorie.title,
      image: categorie.image
        ? process.env.URL_BACKEND +
          "/api/categories/imagen-categorie/" +
          categorie.image
        : null,
      state: categorie.state,
      count_courses: count_courses,
    };
  },
};
