const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    settingKey: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'setting_key'
    },
    settingValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'setting_value'
    }
}, {
    tableName: 'settings',
    timestamps: true
});

module.exports = Setting;
