import express from 'express';
import http from 'http';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from 'cors';

import UserController from './controllers/User';
import redis from './config/redis';
import database from './config/database';
import dbService from './config/database/connection';

const {
  register, loginWithAccount, loginWithMobile, verifyOTP,
  resendOTP,
} = UserController();

// getting env from process
const { env: { NODE_ENV, APP_PORT } } = process;

const app = express();
const server = http.Server(app);

const DB = dbService(database, NODE_ENV, true).start();

// allow cross origin requests
app.use(cors());

// secure express app
app.use(helmet({
  dnsPrefetchControl: false,
  frameguard: false,
  ieNoOpen: false,
}));

// parsing the request bodys
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* setting redis to app */
app.set('redis', redis);

app.post('/register', register);
app.post('/login', loginWithAccount);
app.post('/login/mobile', loginWithMobile);
app.post('/verify/otp', verifyOTP);
app.post('/otp/resend', resendOTP);

server.listen(APP_PORT, () => {
  if (NODE_ENV !== 'production' && NODE_ENV !== 'development') {
    console.error(`NODE_ENV is set to ${NODE_ENV}, but only production and development are valid.`);
    process.exit(1);
  }
  return DB;
});
