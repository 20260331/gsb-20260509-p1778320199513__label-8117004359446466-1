const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'editor', 'user'),
        defaultValue: 'user'
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

// Instance method to check password
User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// Class method to find by credentials
User.findByCredentials = async function (email, password) {
    const user = await this.findOne({ where: { email } });
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    return user;
};

module.exports = User;
