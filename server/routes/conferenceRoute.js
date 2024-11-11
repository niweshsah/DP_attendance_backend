const express = require('express');
const router = express.Router();
const Conference = require('../models/conference');
const Mentor = require('../models/mentor');

// get all conferences
router.get('/', async (req, res) => {
    try {
        const conferences = await Conference.find();
        res.status(200).json(conferences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Create a new conference
router.post('/', async (req, res) => {
  try {
    const conference = new Conference(req.body);
    await conference.save();
    res.status(201).json(conference);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// Get a specific conference by conferenceId
router.get('/:conferenceId', async (req, res) => {
  try {
    const conference = await Conference.findById(req.params.conferenceId);
    if (!conference) {
      return res.status(404).json({ error: 'Conference not found' });
    }
    res.status(200).json(conference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Update a conference by conferenceId
router.put('/:conferenceId', async (req, res) => {
  try {
    const conference = await Conference.findByIdAndUpdate(req.params.conferenceId, req.body, { new: true, runValconferenceIdators: true });
    if (!conference) {
      return res.status(404).json({ error: 'Conference not found' });
    }
    res.status(200).json(conference);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a conference by conferenceId
router.delete('/:conferenceId', async (req, res) => {
  try {
    const conference = await Conference.findByIdAndDelete(req.params.conferenceId);
    if (!conference) {
      return res.status(404).json({ error: 'Conference not found' });
    }
    res.status(200).json({ message: 'Conference deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const AttendeeRoute = require('../routes/attendeeRoute');
router.use('/:conferenceId/attendees', AttendeeRoute);

const EventRoute = require('../routes/eventRoute');
router.use('/:conferenceId/events', EventRoute);

const MentorRoute = require('../routes/mentorRoute');
router.use('/:conferenceId/mentors', MentorRoute);

module.exports = router;
