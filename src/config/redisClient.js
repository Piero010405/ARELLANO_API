import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      tls: {}
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

(async () => {
  await redisClient.connect();
  console.log("✅ Conectado a Redis");

  await redisClient.set('foo', 'bar');
  const result = await redisClient.get('foo');
  console.log(result);
})();

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Connected to Redis Essentials');
  }
};

await redisClient.connect();

export default redisClient;