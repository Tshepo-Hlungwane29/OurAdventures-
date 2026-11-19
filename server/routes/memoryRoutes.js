const express = require('express');
const router = express.Router();

const Memory = require('../models/Memory');

// GET: Retrieve all memories
router.get('/', async (req, res) => {
    try {
        const memories = await Memory.find()
            .populate('adventure')
            .sort({ memoryDate: -1 });

        res.status(200).json(memories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Create a new memory
router.post('/', async (req, res) => {
    try {
        const newMemory = new Memory(req.body);
        const savedMemory = await newMemory.save();

        res.status(201).json(savedMemory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Remove a memory
router.delete('/:id', async (req, res) => {
    try {
        const deletedMemory = await Memory.findByIdAndDelete(req.params.id);

        if (!deletedMemory) {
            return res.status(404).json({ message: 'Memory not found.' });
        }

        res.status(200).json({ message: 'Memory deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;