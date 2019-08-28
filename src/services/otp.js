import fetch from 'node-fetch';
import redis from '../config/redis';

const { SMS_API_URL, SMS_API_TOKEN } = process.env;

const sendOtp = async (mobile, otp) => {
  try {
    const options = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authorization: SMS_API_TOKEN,
      },
      method: 'POST',
      body: `sender_id=FSTSMS&language=english&route=qt&numbers=${mobile}&message=14840&variables={AA}&variables_values=${otp}`,
    };
    const response = await fetch(SMS_API_URL, options);
    /* expiring otp after 30 minutes */
    await redis.set(mobile, otp, 'EX', 1800);
    const json = await response.json();
    return json;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default sendOtp;
