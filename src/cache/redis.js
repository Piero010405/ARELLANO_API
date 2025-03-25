// src/cache/redis.js
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  // host: 'redis-14683.c308.sa-east-1-1.ec2.redns.redis-cloud.com',
  // port: 14683,
  // password: 'DsIhIdFDQZHTtlzwbyWe4RmOadCi6EN0',
  tls: { rejectUnauthorized: false } // Activa TLS para Redis Essentials
});

redis.on('error', (err) => console.error('Redis Client Error:', err));
redis.on('connect', () => console.log('Connected to Redis Essentials'));

export default redis;