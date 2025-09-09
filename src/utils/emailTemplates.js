// src/utils/emailTemplates.js
export const resetPasswordEmail = (name, otp, expiresAt) => {
  return {
    subject: "Código de restablecimiento de contraseña",
    text: `Hola ${name},\n\nTu código para restablecer tu contraseña es: ${otp}\nEste código expirará en ${expiresAt}.\n\nSi no solicitaste este cambio, ignora este correo.`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hola ${name},</h2>
        <p>Tu código de restablecimiento es:</p>
        <h1 style="color:#A2BF3D;">${otp}</h1>
        <p>Este código expirará en <b>${expiresAt}</b>.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      </div>
    `
  };
};
