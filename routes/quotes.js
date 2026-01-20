const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all quotes (for admin)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cotizaciones ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new quote (from public form)
router.post('/', async (req, res) => {
    const {
        fullName,
        phone,
        email,
        city,
        postalCode,
        service,
        propertyType,
        urgency,
        budget,
        contactMethod,
        description
    } = req.body;

    try {
        const [result] = await db.query(
            `INSERT INTO cotizaciones 
            (fullName, phone, email, city, postalCode, service, propertyType, urgency, budget, contactMethod, description) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [fullName, phone, email, city, postalCode, service, propertyType, urgency, budget, contactMethod, description]
        );
        res.status(201).json({ id: result.insertId, message: 'Quote request submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update quote status
router.put('/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE cotizaciones SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Quote status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
