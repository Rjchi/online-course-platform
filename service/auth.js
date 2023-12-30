import token from "./token";

export default {
  /**-------------------------------------------------------
   * | Verificamos para las rutas tipo tiendo,
   * | en esta solo tienen acceso los clientes y el admin
   * -------------------------------------------------------*/
  verifyTienda: async (req, res, next) => {
    if (!req.headers.token)
      return res.status(404).send({
        msg: "NO SE ENVIO EL TOKEN",
      });
    const response = await token.decode(req.headers.token);

    if (response) {
      if (response.rol === "cliente" || response.rol === "admin") {
        next();
      } else {
        return res.status(403).send({
          msg: "NO ESTA PERMITIDO VISITAR ESTA PAGINA",
        });
      }
    } else {
      return res.status(403).send({
        msg: "EL TOKEN ES INVALIDO",
      });
    }
  },

  /**-------------------------------------------------------
   * | Solo tienen acceso los usuarios de tipo administrador
   * -------------------------------------------------------*/
  verifyAdmin: async (req, res, next) => {
    if (!req.headers.token)
      return res.status(404).send({
        msg: "NO SE ENVIO EL TOKEN",
      });
    const response = await token.decode(req.headers.token);

    if (response) {
      if (response.rol === "admin") {
        next();
      } else {
        return res.status(403).send({
          msg: "NO ESTA PERMITIDO VISITAR ESTA PAGINA",
        });
      }
    } else {
      return res.status(403).send({
        msg: "EL TOKEN ES INVALIDO",
      });
    }
  },
};
