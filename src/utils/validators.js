// utils/validators.js

// Lista de contraseñas inseguras comunes
const weakPasswords = [
  "123456", "password", "123456789", "qwerty", "111111", "abc123", "arellano123", "arellano2025", "arellano2022", "arellano2023", "arellano2024", "arellano$2025", "arellano$2025$"
];

/**
 * Valida la seguridad de una contraseña según ISO/NIST
 * @param {string} password
 * @param {object} options - opciones extra (ej. { username, email })
 * @returns {object} { valid: boolean, errors: string[] }
 */

export function validatePassword(password, options = {}) {
    const errors = [];
        
    // Longitud recomendada
    if (password.length < 12) {
        errors.push("La contraseña debe tener al menos 12 caracteres.");
    }

    // Reglas de complejidad
    if (!/[A-Z]/.test(password)) {
        errors.push("Debe contener al menos una letra mayúscula.");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Debe contener al menos una letra minúscula.");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Debe contener al menos un número.");
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) {
        errors.push("Debe contener al menos un carácter especial.");
    }

    // Revisar datos personales
    if (options.username && password.toLowerCase().includes(options.username.toLowerCase())) {
        errors.push("La contraseña no debe contener el nombre de usuario.");
    }
    if (options.email && password.toLowerCase().includes(options.email.split("@")[0].toLowerCase())) {
        errors.push("La contraseña no debe contener el email del usuario.");
    }

    // Contraseñas comunes
    if (weakPasswords.includes(password.toLowerCase())) {
        errors.push("La contraseña es demasiado común e insegura.");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
