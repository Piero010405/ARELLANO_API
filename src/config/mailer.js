// src/config/mailer.js
import mailgun from "mailgun-js";

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
  host: process.env.MAILGUN_BASE_URL || "https://api.mailgun.net/v3",
});

export default mg;
