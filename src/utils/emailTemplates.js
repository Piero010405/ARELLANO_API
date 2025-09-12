// src/utils/emailTemplates.js
import * as React from "react";

export function resetPasswordEmail({ name, otp, expiresAt }) {
  return {
    subject: "Restablecer contraseña - Arellano Auditoría",
    react: (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f2f4f7",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "32px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <img
              src="https://auditoria.arellano.pe/images/logo/LOGO-ARELLANO-BLACK.png"
              alt="Arellano"
              width="160"
              style={{ marginBottom: "16px" }}
            />
            <h2 style={{ color: "#1d2939", margin: 0 }}>
              Restablece tu contraseña
            </h2>
          </div>

          <p style={{ color: "#344054", fontSize: "15px" }}>
            Hola <strong>{name}</strong>,
          </p>
          <p style={{ color: "#344054", fontSize: "15px" }}>
            Recibimos una solicitud para restablecer tu contraseña. Usa el
            siguiente código de verificación:
          </p>

          <div
            style={{
              backgroundColor: "#465FFF",
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: "bold",
              letterSpacing: "4px",
              padding: "16px",
              textAlign: "center",
              borderRadius: "8px",
              margin: "24px 0",
            }}
          >
            {otp}
          </div>

          <p style={{ color: "#344054", fontSize: "15px" }}>
            Este código expirará a las{" "}
            <strong>{expiresAt.toLocaleTimeString()}</strong>.
          </p>

          <p style={{ color: "#344054", fontSize: "14px", marginTop: "32px" }}>
            Si no solicitaste este cambio, puedes ignorar este correo.
          </p>

          <p
            style={{
              fontSize: "13px",
              color: "#98a2b3",
              marginTop: "32px",
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} Arellano Auditoría — Todos los
            derechos reservados.
          </p>
        </div>
      </div>
    ),
  };
}

