import Sequelize from 'sequelize';

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

const database = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
    timezone: '+05:30',
  },
);

export default database;
