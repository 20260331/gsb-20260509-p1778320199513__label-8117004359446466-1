const express = require('express');
const router = express.Router();
const { Setting } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Get all settings (public)
router.get('/', async (req, res) => {
    try {
        const settings = await Setting.findAll();

        // Convert to key-value object
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.settingKey] = setting.settingValue;
        });

        res.json({ settings: settingsObj });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Get setting by key
router.get('/:key', async (req, res) => {
    try {
        const setting = await Setting.findOne({
            where: { settingKey: req.params.key }
        });

        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' });
        }

        res.json({
            key: setting.settingKey,
            value: setting.settingValue
        });
    } catch (error) {
        console.error('Get setting error:', error);
        res.status(500).json({ error: 'Failed to fetch setting' });
    }
});

// Update settings (admin only)
router.put('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { settings } = req.body;

        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ error: 'Settings object is required' });
        }

        // Update or create each setting
        for (const [key, value] of Object.entries(settings)) {
            await Setting.upsert({
                settingKey: key,
                settingValue: value
            });
        }

        // Fetch updated settings
        const allSettings = await Setting.findAll();
        const settingsObj = {};
        allSettings.forEach(setting => {
            settingsObj[setting.settingKey] = setting.settingValue;
        });

        res.json({
            message: 'Settings updated',
            settings: settingsObj
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Delete setting (admin only)
router.delete('/:key', authenticate, authorize('admin'), async (req, res) => {
    try {
        const setting = await Setting.findOne({
            where: { settingKey: req.params.key }
        });

        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' });
        }

        await setting.destroy();
        res.json({ message: 'Setting deleted successfully' });
    } catch (error) {
        console.error('Delete setting error:', error);
        res.status(500).json({ error: 'Failed to delete setting' });
    }
});

module.exports = router;
