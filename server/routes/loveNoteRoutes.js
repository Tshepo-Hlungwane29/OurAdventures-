const express = require('express');
const router = express.Router();

const LoveNote = require('../models/LoveNote');

// GET: Retrieve all love notes
router.get('/', async (req, res) => {
    try {
        const loveNotes = await LoveNote.find().sort({ createdAt: -1 });
        res.status(200).json(loveNotes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Create a new love note
router.post('/', async (req, res) => {
    try {
        const newLoveNote = new LoveNote(req.body);
        const savedLoveNote = await newLoveNote.save();

        res.status(201).json(savedLoveNote);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Remove a love note
router.delete('/:id', async (req, res) => {
    try {
        const deletedLoveNote = await LoveNote.findByIdAndDelete(req.params.id);

        if (!deletedLoveNote) {
            return res.status(404).json({ message: 'Love note not found.' });
        }

        res.status(200).json({ message: 'Love note deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;