import models from "../../models";
import token from "../../service/token";

import fs from "fs";
import ejs from "ejs";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";

export default {
  send_mail: async (req, res) => {
    try {
      var readHTMLFile = function (path, callback) {
        fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
          if (err) {
            throw err;
            callback(err);
          } else {
            callback(null, html);
          }
        });
      };

      var transporter = nodemailer.createTransport(
        smtpTransport({
          service: "gmail",
          host: "smtp.gmail.com",
          auth: {
            user: `${process.env.EMAIL}`,
            pass: `${process.env.EMAIL_PASSWORD}`,
          },
        })
      );

      readHTMLFile(process.cwd() + "/mails/email_sale.html", (err, html) => {
        let rest_html = ejs.render(html, {});

        var template = handlebars.compile(rest_html);
        var htmlToSend = template({ op: true });

        var mailOptions = {
          from: `${process.env.EMAIL}`,
          to: email_cliente,
          subject: "Finaliza tu compra " + orden._id,
          html: htmlToSend,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (!error) {
            console.log("Email sent: " + info.response);
          }
        });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "OCURRIO UN ERROR",
      });
    }
  },
  register: async (req, res) => {
    try {
      let user = await token.decode(req.headers.token);
      req.body.user = user._id;

      let sale = await models.Sale.create(req.body);
      let carts = await models.Cart.find({ user: user._id });

      for (let cart of carts) {
        cart = cart.toObject();
        cart.sale = sale._id;

        await models.SaleDetail.create(cart);
        await models.CourseStudent.create({
          user: user._id,
          course: cart.course,
        });
        await models.Cart.findByIdAndDelete({ _id: cart._id });
      }
      // TODO: envio del email
      return res.status(200).json({
        message: 200,
        message_text: "LA ORDEN SE GENERO CORRECTAMENTE",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "OCURRIO UN ERROR",
      });
    }
  },
};
