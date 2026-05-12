const express = require('express');
const router = express.Router();
const { Category, Article } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Get all categories (public)
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']],
            include: [{
                model: Article,
                as: 'articles',
                attributes: ['id'],
                where: { status: 'published' },
                required: false
            }]
        });

        // Add article count
        const categoriesWithCount = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            articleCount: cat.articles ? cat.articles.length : 0,
            createdAt: cat.createdAt
        }));

        res.json({ categories: categoriesWithCount });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ category });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

// Create category (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const category = await Category.create({ name, description });
        res.status(201).json({
            message: 'Category created',
            category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Update category (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const { name, description } = req.body;

        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ where: { name } });
            if (existingCategory) {
                return res.status(400).json({ error: 'Category name already exists' });
            }
        }

        await category.update({
            ...(name && { name }),
            ...(description !== undefined && { description })
        });

        res.json({
            message: 'Category updated',
            category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Delete category (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await category.destroy();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

module.exports = router;
