import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

// const redisClient = createClient({
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_PASSWORD,
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT,
//   }
// });

// redisClient.on('error', (err) => console.error('Redis Client Error:', err));

// export const connectRedis = async () => {
//   if (!redisClient.isOpen) {
//     await redisClient.connect();
//     console.log('Connected to Redis Essentials');
//   }
// };

// await redisClient.connect();

// export default redisClient;

const redisClient = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      tls: {}
    }
    // username: 'default',
    // password: 'DsIhIdFDQZHTtlzwbyWe4RmOadCi6EN0',
    // socket: {
    //     host: 'redis-14683.c308.sa-east-1-1.ec2.redns.redis-cloud.com',
    //     port: 14683
    //     tls: {}
    // }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

(async () => {
  await client.connect();
  console.log("✅ Conectado a Redis");

  await client.set('foo', 'bar');
  const result = await client.get('foo');
  console.log(result); // >>> bar
})();

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Connected to Redis Essentials');
  }
};

await redisClient.connect();

export default redisClient;