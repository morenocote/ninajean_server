const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('./auth');

// Get all contractors
router.get('/', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM contractors ORDER BY nombre ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new contractor
router.post('/', verifyToken, async (req, res) => {
    const { nombre, telefono, email, direccion, estado } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO contractors (nombre, telefono, email, direccion, estado) VALUES (?, ?, ?, ?, ?)',
            [nombre, telefono, email, direccion, estado || 'activo']
        );
        res.status(201).json({ id: result.insertId, message: 'Contractor created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update contractor
router.put('/:id', verifyToken, async (req, res) => {
    const { nombre, telefono, email, direccion, estado } = req.body;

    try {
        await db.query(
            'UPDATE contractors SET nombre = ?, telefono = ?, email = ?, direccion = ?, estado = ? WHERE id = ?',
            [nombre, telefono, email, direccion, estado, req.params.id]
        );
        res.json({ message: 'Contractor updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete contractor
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await db.query('DELETE FROM contractors WHERE id = ?', [req.params.id]);
        res.json({ message: 'Contractor deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
