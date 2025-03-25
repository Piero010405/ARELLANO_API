// src/cache/redis.js
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: {}  // Activa TLS para Redis Essentials
});

redis.on('error', (err) => console.error('Redis Client Error:', err));
redis.on('connect', () => console.log('Connected to Redis Essentials'));

export default redis;