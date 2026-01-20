const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File Filter (Images Only)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 250 * 1024 // 250KB
    },
    fileFilter: fileFilter
});

// Get all blogs
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM blogs ORDER BY date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single blog by slug
router.get('/:slug', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM blogs WHERE slug = ?', [req.params.slug]);
        if (rows.length === 0) return res.status(404).json({ message: 'Blog not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new blog with image upload
router.post('/', upload.single('image'), async (req, res) => {
    const { slug, title, excerpt, content, date, readTime, category } = req.body;
    let imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.image;

    try {
        const [result] = await db.query(
            'INSERT INTO blogs (slug, title, excerpt, content, image, date, readTime, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [slug, title, excerpt, content, imagePath, date, readTime, category]
        );
        res.status(201).json({ id: result.insertId, message: 'Blog created successfully' });
    } catch (err) {
        // Delete uploaded file if DB insert fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: err.message });
    }
});

// Update blog with optional image upload
router.put('/:id', upload.single('image'), async (req, res) => {
    const { title, excerpt, content, date, readTime, category } = req.body;

    // If a new file is uploaded, use its path. Otherwise, use the existing image path from body (if provided)
    let imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.image;

    try {
        // If we have a new image, we might want to delete the old one here (optional but recommended)
        if (req.file) {
            const [oldRows] = await db.query('SELECT image FROM blogs WHERE id = ?', [req.params.id]);
            if (oldRows.length > 0 && oldRows[0].image && oldRows[0].image.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '..', oldRows[0].image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        await db.query(
            'UPDATE blogs SET title = ?, excerpt = ?, content = ?, image = ?, date = ?, readTime = ?, category = ? WHERE id = ?',
            [title, excerpt, content, imagePath, date, readTime, category, req.params.id]
        );
        res.json({ message: 'Blog updated successfully' });
    } catch (err) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: err.message });
    }
});

// Delete blog (and its image)
router.delete('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT image FROM blogs WHERE id = ?', [req.params.id]);
        if (rows.length > 0 && rows[0].image && rows[0].image.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '..', rows[0].image);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query('DELETE FROM blogs WHERE id = ?', [req.params.id]);
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
