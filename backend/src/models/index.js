const User = require('./User');
const Article = require('./Article');
const Category = require('./Category');
const Tag = require('./Tag');
const Setting = require('./Setting');
const sequelize = require('../config/database');

// Define associations
// User - Article (One to Many)
User.hasMany(Article, { foreignKey: 'authorId', as: 'articles' });
Article.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Category - Article (One to Many)
Category.hasMany(Article, { foreignKey: 'categoryId', as: 'articles' });
Article.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Article - Tag (Many to Many)
Article.belongsToMany(Tag, {
    through: 'article_tags',
    foreignKey: 'article_id',
    otherKey: 'tag_id',
    as: 'tags'
});
Tag.belongsToMany(Article, {
    through: 'article_tags',
    foreignKey: 'tag_id',
    otherKey: 'article_id',
    as: 'articles'
});

module.exports = {
    sequelize,
    User,
    Article,
    Category,
    Tag,
    Setting
};
