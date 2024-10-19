const Sequelize = require('sequelize')
const sequelize = require('../util/database')

const Expense = sequelize.define('expense', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  income: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  expense: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  Description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Expense;
