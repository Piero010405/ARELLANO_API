// src/utils/consts.js
export const API_ENDPOINTS = {
  RESET_PASSWORD: "reset-password",
  LOGIN: "login",
};

export const API_ENDPOINTS_RATE_LIMIT = {
  RESET_PASSWORD: 5,
  LOGIN: 10,
};

export const TIME_LIMITS = {
  RESET_PASSWORD: 10 * 60 * 1000, // 10 min
  LOGIN: 10 * 60 * 1000, // 10 min
};