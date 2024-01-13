export default {
  apiResourceCourse: (course) => {
    return {
      _id: course._id,
      slug: course.slug,
      user: {
        // Formatiamos al usuario
        _id: course.user._id,
        name: course.user.name,
        surname: course.user.surname,
      },
      title: course.title,
      state: course.state,
      level: course.level,
      idioma: course.idioma,
      vimeo_id: course.vimeo_id,
      subtitle: course.subtitle,
      categorie: {
        // Formatiamos la categoria
        _id: course.categorie._id,
        title: course.categorie.title,
      },
      price_usd: course.price_usd,
      price_soles: course.price_soles,
      description: course.description,
      requirements: JSON.parse(course.requirements),
      who_is_it_for: JSON.parse(course.who_is_it_for),
      image: course.image
        ? process.env.URL_BACKEND + "/api/courses/imagen-course/" + course.image
        : null,
    };
  },
};
