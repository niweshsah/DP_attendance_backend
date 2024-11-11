const express = require('express');
// const router = express.Router();
const router = express.Router({ mergeParams: true }); // Important to merge params from the parent route

const Event = require('../models/event'); // Adjust the path as necessary

// Create a new event
router.post('/', async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().populate('conference');
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific event by ID
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('conference');
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an event by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedEvent) return res.status(404).json({ error: 'Event not found' });
        res.status(200).json(updatedEvent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete an event by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ error: 'Event not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




module.exports = router;
