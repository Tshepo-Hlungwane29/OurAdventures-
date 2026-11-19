const express = require('express');
const router = express.Router();

const Adventure = require('../models/Adventure');

// GET: Retrieve all adventures
router.get('/', async (req, res) => {
    try {
        const adventures = await Adventure.find().sort({ adventureDate: 1 });
        res.status(200).json(adventures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Create a new adventure
router.post('/', async (req, res) => {
    try {
        // Check whether another planned adventure exists
        const existingAdventure = await Adventure.findOne({
            status: 'planned'
        });

        if (existingAdventure) {
            return res.status(409).json({
                message: 'You already have a planned adventure. Complete or cancel it before booking another one. ❤️'
            });
        }

        // Save the new adventure
        const newAdventure = new Adventure(req.body);
        const savedAdventure = await newAdventure.save();

        res.status(201).json(savedAdventure);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT: Update an adventure
router.put('/:id', async (req, res) => {
    try {
        const updatedAdventure = await Adventure.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedAdventure) {
            return res.status(404).json({
                message: 'Adventure not found.'
            });
        }

        res.status(200).json(updatedAdventure);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Remove an adventure
router.delete('/:id', async (req, res) => {
    try {
        const deletedAdventure = await Adventure.findByIdAndDelete(req.params.id);

        if (!deletedAdventure) {
            return res.status(404).json({
                message: 'Adventure not found.'
            });
        }

        res.status(200).json({
            message: 'Adventure deleted successfully.'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;