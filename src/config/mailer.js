// src/config/mailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.OUTLOOK_USER, // tu correo empresarial
    pass: process.env.OUTLOOK_PASS, // contraseña o app password
  },
  tls: {
    ciphers: "SSLv3",
  },
});

export default transporter;
