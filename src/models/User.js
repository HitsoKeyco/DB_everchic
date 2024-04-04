const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const User = sequelize.define('user', {
    
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isVerify: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verificationToken: { // Agrega este campo para el token de verificación
        type: DataTypes.STRING,
        allowNull: true // Puede ser nulo temporalmente hasta que se asigne un token ojo
    }
});

User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
}

module.exports = User;