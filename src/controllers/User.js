import md5 from 'md5';
import Users from '../models/users';
import generateToken from '../services/token';
import sendOtp from '../services/otp';

const UserController = () => {
  const register = async (req, res) => {
    const {
      body: { email, password, mobile },
    } = req;
    if (email !== '' && password !== '' && mobile !== '') {
      try {
        await Users.create(req.body, {
          fileds: ['mobile', 'email', 'password'],
        });
        return res.status(200).json({ msg: 'You\'ve registered successfully. You can login.' });
      } catch (err) {
        if (err.errors && err.errors.length > 0) {
          const errors = err.errors.map((er) => er.message);
          return res.status(400).json({ errors });
        }
        return res.status(500).json({ msg: 'Internal server error' });
      }
    }
    return res.status(400).json({ errors: ['email or password has problem'] });
  };
  const loginWithAccount = async (req, res) => {
    const { body: { email, password } } = req;
    if (email && password) {
      const user = await Users.findOne({
        where: {
          email,
        },
      });
      if (!user) {
        return res.status(400).json({ msg: 'Email not found. Please register.' });
      }
      if (!user.is_active) {
        return res.status(400).json({ msg: 'Oops! Your account has been disabled.' });
      }
      if (md5(password) === user.password) {
        const token = await generateToken(user);
        return res.status(200).json({ user, token });
      }
      return res.status(400).json({ msg: 'Invalid email or password entered.' });
    }
    return res.status(400).json({ msg: 'email and password can\'t be empty' });
  };
  const loginWithMobile = async (req, res) => {
    const { body: { mobile } } = req;
    if (mobile && mobile.length === 10) {
      const user = await Users.findOne({
        where: {
          mobile,
        },
      });
      if (!user) {
        return res.status(400).json({ msg: 'User not found. Please register.' });
      }
      const otp = Math.floor(Math.random() * 90000) + 10000;
      await sendOtp(mobile, otp);
      return res.status(200).json({ msg: `OTP has been sent to ${mobile}` });
    }
    return res.status(400).json({ msg: 'Invalid Mobile Number.' });
  };
  const verifyOTP = async (req, res) => {
    const { body: { mobile, otp } } = req;
    const redis = req.app.get('redis');
    if (mobile && otp) {
      /* check redis for mobile number */
      const otpInCache = await redis.get(mobile);
      if (!otpInCache) return res.status(400).json({ msg: 'OTP expired or not found. Request OTP again' });
      if (Number(otp) === Number(otpInCache)) {
        /* async update user mobile as verified */
        await Users.update({
          is_mobile_verified: true,
        }, {
          where: {
            mobile,
          },
        });
        const user = await Users.findOne({
          where: {
            mobile,
          },
        });
        /* delete otp from redis */
        if (process.env.NODE_ENV === 'production') await redis.del(mobile);
        const token = await generateToken(user);
        return res.status(200).json({ user, token });
      } return res.status(400).json({ msg: 'Invalid OTP entered. Please try again!' });
    } return res.status(400).json({ msg: 'mobile or otp missing from request' });
  };
  const resendOTP = async (req, res) => {
    const { body: { mobile } } = req;
    const redis = req.app.get('redis');
    if (mobile && mobile.length === 10) {
      const otpInCache = await redis.get(mobile);
      if (otpInCache) {
        /* send same otp from cache to user so that if user receives old message it wont confuse */
        await sendOtp(mobile, otpInCache);
        return res.status(200).json({ msg: 'OTP has been resent.' });
      }
      const otp = Math.floor(Math.random() * 90000) + 10000;
      const isOtpSent = await sendOtp(mobile, otp);
      if (!isOtpSent) return res.status(503).json({ msg: 'Error while sending SMS to mobile number. Contact us.' });
      return res.status(200).json({ msg: `OTP has been sent to ${mobile}` });
    } return res.status(400).json({ msg: 'Invalid mobile number' });
  };
  return {
    register,
    loginWithAccount,
    loginWithMobile,
    verifyOTP,
    resendOTP,
  };
};

export default UserController;
