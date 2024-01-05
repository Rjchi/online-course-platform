export default {
  apiResourceUser: (user) => {
    return {
      _id: user._id,
      rol: user.rol,
      name: user.name,
      email: user.email,
      avatar: user.avatar
        ? process.env.URL_BACKEND + "/api/auth/imagen-usuario/" + user.avatar
        : null,
      surname: user.surname,
      profession: user.profession,
      description: user.description,
    };
  },
};
