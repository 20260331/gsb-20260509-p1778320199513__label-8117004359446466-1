const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Article, User, Category, Tag } = require('../models');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');

// Get all articles (public)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            tag,
            search,
            status = 'published'
        } = req.query;
        const offset = (page - 1) * limit;

        const where = {};

        // Only show published articles for non-admin users
        if (!req.user || req.user.role === 'user') {
            where.status = 'published';
        } else if (status) {
            where.status = status;
        }

        if (category) {
            where.categoryId = category;
        }

        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { summary: { [Op.like]: `%${search}%` } }
            ];
        }

        const include = [
            { model: User, as: 'author', attributes: ['id', 'username', 'avatar'] },
            { model: Category, as: 'category', attributes: ['id', 'name'] },
            { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
        ];

        // Filter by tag
        if (tag) {
            include[2].where = { id: tag };
        }

        const { count, rows: articles } = await Article.findAndCountAll({
            where,
            include,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        res.json({
            articles,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get articles error:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// Get article by ID
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id, {
            include: [
                { model: User, as: 'author', attributes: ['id', 'username', 'avatar', 'bio'] },
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
            ]
        });

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Check if user can view non-published articles
        if (article.status !== 'published') {
            if (!req.user || (req.user.role === 'user' && article.authorId !== req.user.id)) {
                return res.status(404).json({ error: 'Article not found' });
            }
        }

        // Increment view count
        await article.increment('viewCount');

        res.json({ article });
    } catch (error) {
        console.error('Get article error:', error);
        res.status(500).json({ error: 'Failed to fetch article' });
    }
});

// Create article
router.post('/', authenticate, authorize('admin', 'editor'), async (req, res) => {
    try {
        const { title, content, summary, coverImage, categoryId, status, tagIds } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const article = await Article.create({
            title,
            content,
            summary: summary || content.substring(0, 200),
            coverImage,
            categoryId,
            status: status || 'draft',
            authorId: req.user.id
        });

        // Add tags
        if (tagIds && tagIds.length > 0) {
            await article.setTags(tagIds);
        }

        // Fetch with associations
        const fullArticle = await Article.findByPk(article.id, {
            include: [
                { model: User, as: 'author', attributes: ['id', 'username', 'avatar'] },
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
            ]
        });

        res.status(201).json({
            message: 'Article created',
            article: fullArticle
        });
    } catch (error) {
        console.error('Create article error:', error);
        res.status(500).json({ error: 'Failed to create article' });
    }
});

// Update article
router.put('/:id', authenticate, authorize('admin', 'editor'), async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Check ownership or admin
        if (article.authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to edit this article' });
        }

        const { title, content, summary, coverImage, categoryId, status, tagIds } = req.body;

        await article.update({
            ...(title && { title }),
            ...(content && { content }),
            ...(summary !== undefined && { summary }),
            ...(coverImage !== undefined && { coverImage }),
            ...(categoryId !== undefined && { categoryId }),
            ...(status && { status })
        });

        // Update tags
        if (tagIds !== undefined) {
            await article.setTags(tagIds);
        }

        // Fetch with associations
        const fullArticle = await Article.findByPk(article.id, {
            include: [
                { model: User, as: 'author', attributes: ['id', 'username', 'avatar'] },
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
            ]
        });

        res.json({
            message: 'Article updated',
            article: fullArticle
        });
    } catch (error) {
        console.error('Update article error:', error);
        res.status(500).json({ error: 'Failed to update article' });
    }
});

// Delete article
router.delete('/:id', authenticate, authorize('admin', 'editor'), async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Check ownership or admin
        if (article.authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this article' });
        }

        await article.destroy();
        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Delete article error:', error);
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

module.exports = router;
