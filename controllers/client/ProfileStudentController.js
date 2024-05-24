export default {
  profileStudent: async (req, res) => {
    try {
    } catch (error) {
      return res.status(500).send({
        message: 500,
        message_text: "OCURRIO UN ERROR",
      });
    }
  },
};
