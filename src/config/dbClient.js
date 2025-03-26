import dotenv from 'dotenv';
dotenv.config();

const dbSettings = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
     trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'true'
  }
};

export default dbSettings;