const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const UserDetails = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  useremail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userpassword: {
    type: Sequelize.STRING,
    allowNull: false
  },
  ispremiumuser: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false 
  },
  totalExpense: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  
});

module.exports = UserDetails;
