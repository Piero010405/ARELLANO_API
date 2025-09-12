import React from "react";
import { Html, Head, Preview, Body, Container, Section, Text } from "@react-email/components";

export function ResetPasswordEmail({ name, otp, expiresAt }) {
  return React.createElement(
    Html,
    null,
    React.createElement(Head, null),
    React.createElement(Preview, null, "Restablecimiento de contraseña"),
    React.createElement(
      Body,
      { style: { backgroundColor: "#f4f4f7", fontFamily: "Arial, sans-serif" } },
      React.createElement(
        Container,
        { style: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px" } },
        React.createElement(Section, null,
          React.createElement(Text, { style: { fontSize: "18px", fontWeight: "bold" } }, `Hola ${name},`),
          React.createElement(Text, null, "Hemos recibido una solicitud para restablecer tu contraseña."),
          React.createElement(Text, null, "Tu código de verificación es:"),
          React.createElement("div", {
            style: {
              backgroundColor: "#A2BF3D",
              color: "#fff",
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
              borderRadius: "6px",
              padding: "10px",
              margin: "20px 0"
            }
          }, otp),
          React.createElement(Text, null, `Este código expirará a las ${expiresAt.toLocaleTimeString()}.`)
        )
      )
    )
  );
}
