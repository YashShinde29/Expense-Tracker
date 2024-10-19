const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const { v4: uuidv4 } = require('uuid');

const ForgotPasswordRequest = sequelize.define('forgotPasswordRequest', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    }
});

module.exports = ForgotPasswordRequest;
