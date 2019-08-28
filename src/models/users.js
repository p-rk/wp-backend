import Sequelize from 'sequelize';
import md5 from 'md5';
import DB from '../config/database';

const hooks = {
  beforeCreate(user) {
    const { password } = user;
    user.password = md5(password); // eslint-disable-line no-param-reassign
  },
};

const tableName = 'users';

const User = DB.define('User', {
  uuid: {
    type: Sequelize.UUID,
    allowNull: false,
    unique: true,
    defaultValue: Sequelize.UUIDV4,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'Email already registered.',
    },
    validate: {
      isEmail: {
        args: true,
        msg: 'Email invalid.',
      },
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  mobile: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: {
      args: true,
      msg: 'Mobile Number already registered.',
    },
  },
  is_email_verified: {
    type: Sequelize.BOOLEAN,
    defaultValue: 0,
  },
  is_mobile_verified: {
    type: Sequelize.BOOLEAN,
    defaultValue: 0,
  },
  is_active: {
    type: Sequelize.BOOLEAN,
    defaultValue: 1,
  },
}, { hooks, tableName, underscored: true });

/* eslint-disable-next-line */
User.prototype.toJSON = function () {
  const {
    id, uuid, username, email, is_email_verified: isEmailVerified, is_mobile_verified: isMobileVerified,
  } = this.get();
  return {
    id,
    uuid,
    isEmailVerified,
    isMobileVerified,
    username,
    email,
  };
};

export default User;
