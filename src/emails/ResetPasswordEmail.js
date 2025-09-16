import React from "react";
import { Html, Head, Preview, Body, Section, Text, Img } from "@react-email/components";

export function ResetPasswordEmail({ name, otp, expiresAt }) {
  return React.createElement(
    Html,
    null,
    React.createElement(Head, null),
    React.createElement(Preview, null, "Restablecimiento de contraseña"),
    React.createElement(
      Body,
      {
        style: {
          margin: 0,
          padding: 0,
          backgroundColor: "#F5F6FA",
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: "#000000",
        },
      },

      // Banner con logo + títulos
      React.createElement(
        Section,
        {
          style: {
            maxWidth: "600px",
            margin: "0 auto",
            padding: "30px 30px",
            backgroundColor: "#0F192A",
            textAlign: "center",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            flexDirection: "column",
            alignItems: "left",
            justifyContent: "flex-start",
            gap: "20px",
          },
        },
        React.createElement(Img, {
          src: "https://arellano.pe/wp-content/uploads/2019/07/LOGO-ARELLANO-copia.png",
          width: "168",
          height: "50",
          alt: "Logo",
          style: { display: "block", margin: "0 auto 5px auto" },
        }),
        React.createElement(
          Text,
          { style: { fontSize: "20px", fontWeight: "bold", margin: "0", color: "#FFFFFF", marginBottom: "15px" } },
          "Restablecer Contraseña"
        ),
        React.createElement(
          Text,
          { style: { fontSize: "42px", fontWeight: "bold", margin: "5px 0 0 0", color: "#FFFFFF" } },
          "Verifica tu E-mail!"
        )
      ),

      // Cuerpo principal
      React.createElement(
        Section,
        {
          style: {
            backgroundColor: "#FFFFFF",
            maxWidth: "600px",
            margin: "0 auto",
            padding: "30px 40px",
            textAlign: "left",
          },
        },

        React.createElement(
          Text,
          { style: { fontSize: "16px", marginBottom: "10px" } },
          `Hola ${name},`
        ),

        React.createElement(
          Text,
          { style: { fontSize: "16px", marginBottom: "10px", lineHeight: "24px" } },
          "Hemos recibido una solicitud para restablecer tu contraseña. Usa el siguiente código de verificación:"
        ),

        // Código OTP estilo “cajas”
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "flex-start",
              margin: "30px 0",
            },
          },
          otp.toString().split("").map((digit, index) =>
            React.createElement(
              "div",
              {
                key: index,
                style: {
                  border: "1px solid #365cce",
                  borderRadius: "8px",
                  padding: "5px 1px",
                  fontSize: "24px",
                  color: "#365cce",
                  textAlign: "center",
                  minWidth: "40px",
                  marginLeft: "15px",
                },
              },
              digit
            )
          )
        ),
        
        // Texto secundario
        React.createElement(
          Text,
          {
            style: {
              fontSize: "16px",
              lineHeight: "22px",
            },
          },
          `Este código expirará a las ${expiresAt.toLocaleTimeString()} En caso de no haber solicitado el código, informar al administrador.`
        ),

        // Saludos
        React.createElement(
          Text,
          {
            style: {
              fontSize: "16px",
              lineHeight: "22px",
              margin: "0"
            },
          },
          `Saludos,`
        ),
        React.createElement(
          Text,
          {
            style: {
              fontSize: "16px",
              lineHeight: "22px",
              margin: '0'
            },
          },
          `Equipo Control Campo.`
        )
      )
    )
  );
}
