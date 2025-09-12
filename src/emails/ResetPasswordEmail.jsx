// src/emails/ResetPasswordEmail.jsx
import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
} from "@react-email/components";

export const ResetPasswordEmail = ({ name, otp, expiresAt }) => {
  return (
    <Html>
      <Head />
      <Preview>Tu código para restablecer contraseña</Preview>
      <Body style={{ backgroundColor: "#f2f4f7", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "12px" }}>
          <Section style={{ textAlign: "center", marginBottom: "24px" }}>
            <img
              src="https://auditoria.arellano.pe/images/logo/LOGO-ARELLANO-BLACK.png"
              width="160"
              alt="Arellano"
            />
            <Text style={{ fontSize: "20px", fontWeight: "600", marginTop: "16px" }}>
              Restablece tu contraseña
            </Text>
          </Section>

          <Text>Hola <strong>{name}</strong>,</Text>
          <Text>
            Usa el siguiente código para restablecer tu contraseña (expira a las{" "}
            {expiresAt.toLocaleTimeString()}):
          </Text>

          <Section style={{
            backgroundColor: "#465FFF",
            color: "#fff",
            fontSize: "28px",
            fontWeight: "bold",
            letterSpacing: "4px",
            textAlign: "center",
            borderRadius: "8px",
            padding: "16px",
            margin: "24px 0",
          }}>
            {otp}
          </Section>

          <Text style={{ fontSize: "14px", color: "#344054" }}>
            Si no solicitaste este cambio, ignora este correo.
          </Text>

          <Text style={{ textAlign: "center", marginTop: "32px", fontSize: "12px", color: "#98a2b3" }}>
            © {new Date().getFullYear()} Arellano Auditoría — Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
