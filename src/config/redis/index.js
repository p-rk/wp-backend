import Redis from 'ioredis';

const redis = new Redis({
  port: 6379,
  host: '127.0.0.1',
  family: 4,
  db: 2,
});

redis.on('connect', () => {
  console.log('connected to redis....');
});

export default redis;
