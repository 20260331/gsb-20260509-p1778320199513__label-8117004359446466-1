const express = require('express');
const router = express.Router();
const { Tag, Article } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Get all tags (public)
router.get('/', async (req, res) => {
    try {
        const tags = await Tag.findAll({
            order: [['name', 'ASC']],
            include: [{
                model: Article,
                as: 'articles',
                attributes: ['id'],
                where: { status: 'published' },
                required: false,
                through: { attributes: [] }
            }]
        });

        // Add article count
        const tagsWithCount = tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            articleCount: tag.articles ? tag.articles.length : 0,
            createdAt: tag.createdAt
        }));

        res.json({ tags: tagsWithCount });
    } catch (error) {
        console.error('Get tags error:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// Get tag by ID
router.get('/:id', async (req, res) => {
    try {
        const tag = await Tag.findByPk(req.params.id);
        if (!tag) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.json({ tag });
    } catch (error) {
        console.error('Get tag error:', error);
        res.status(500).json({ error: 'Failed to fetch tag' });
    }
});

// Create tag (admin/editor)
router.post('/', authenticate, authorize('admin', 'editor'), async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Tag name is required' });
        }

        const existingTag = await Tag.findOne({ where: { name } });
        if (existingTag) {
            return res.status(400).json({ error: 'Tag already exists' });
        }

        const tag = await Tag.create({ name });
        res.status(201).json({
            message: 'Tag created',
            tag
        });
    } catch (error) {
        console.error('Create tag error:', error);
        res.status(500).json({ error: 'Failed to create tag' });
    }
});

// Update tag (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const tag = await Tag.findByPk(req.params.id);
        if (!tag) {
            return res.status(404).json({ error: 'Tag not found' });
        }

        const { name } = req.body;

        if (name && name !== tag.name) {
            const existingTag = await Tag.findOne({ where: { name } });
            if (existingTag) {
                return res.status(400).json({ error: 'Tag name already exists' });
            }
        }

        await tag.update({ ...(name && { name }) });

        res.json({
            message: 'Tag updated',
            tag
        });
    } catch (error) {
        console.error('Update tag error:', error);
        res.status(500).json({ error: 'Failed to update tag' });
    }
});

// Delete tag (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const tag = await Tag.findByPk(req.params.id);
        if (!tag) {
            return res.status(404).json({ error: 'Tag not found' });
        }

        await tag.destroy();
        res.json({ message: 'Tag deleted successfully' });
    } catch (error) {
        console.error('Delete tag error:', error);
        res.status(500).json({ error: 'Failed to delete tag' });
    }
});

module.exports = router;
