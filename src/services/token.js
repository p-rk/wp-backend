import crypto from 'crypto';
import redis from '../config/redis';

const generateToken = async (user) => {
  const token = await crypto.randomBytes(48).toString('hex');
  /* login token to redis */
  await redis.hset(token, 'user', JSON.stringify({ user }));
  await redis.expire(token, 24 * 60 * 60 * 7);
  return token;
};

export default generateToken;
