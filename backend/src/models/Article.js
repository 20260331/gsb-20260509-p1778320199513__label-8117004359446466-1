const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Article = sequelize.define('Article', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    summary: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    coverImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'cover_image'
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'author_id'
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'category_id'
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
    },
    viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'view_count'
    }
}, {
    tableName: 'articles',
    timestamps: true
});

module.exports = Article;
