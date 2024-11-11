const express = require("express");
// const router = express.Router();
const router = express.Router({ mergeParams: true }); // Important to merge params from the parent route

const Attendee = require("../models/attendee"); // Import the Attendee model
const Conference = require("../models/conference"); // Import the Conference model
// const multer = require('multer');
const upload = require("../models/attendee").upload; // Import the multer setup from the Attendee model
const User = require("../models/user");

const { jwtAuthMiddleware, generateToken } = require("../utils/jwt");

const {
  sendQRCodeEmail,
  sendQRCodesToAllAttendees,
} = require("../utils/sendEmail");

router.get("/test", async (req, res) => {
  try {
    const conferenceId = req.params.conferenceId;
    const conference = await Conference.findById(conferenceId);
    if (!conference) {
      return res
        .status(404)
        .json({ error: "Conference not found while testing" });
    }

    res.status(200).json({ message: "Attendee route works" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new attendee
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { name, designation, mobile, email, about, secretQRSTring } =
      req.body;

    const photo = req.file
      ? {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        }
      : null;

    const attendee = new Attendee({
      name,
      designation,
      mobile,
      email,
      about,
      secretQRSTring,
      photo,
    });

    await attendee.save();
    res.status(201).json(attendee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// register attendee for a conference
router.get("/:attendeeId/registerForConference", async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.attendeeId);
    if (!attendee) {
      return res.status(404).json({ error: "Attendee not found" });
    }

    const conferenceId = req.params.conferenceId;
    const conference = await Conference.findById(conferenceId);
    if (!conference) {
      return res.status(404).json({ error: "Conference not found" });
    }

    if (attendee.conferenceAttendance.has(conferenceId)) {
      return res
        .status(400)
        .json({ error: "Attendee is already registered for the conference" });
    }

    conference.attendees.set(attendee.id, { attended: false });

    attendee.foodCouponUsed.set(conferenceId, {}); // give food coupon on registration and set the value of the key to an empty object as default values are already set in the model

    attendee.conferenceAttendance.set(conferenceId, { attended: false });

    await conference.save();

    await attendee.save();

    res.status(200).json(attendee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



// mark their attendance at a conference
router.post("/:attendeeId/markConferenceAttendance", async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.attendeeId);
    if (!attendee) {
      return res.status(404).json({ error: "Attendee not found" });
    }

    const conferenceId = req.params.conferenceId;
    const conference = await Conference.findById(conferenceId);
    if (!conference) {
      return res.status(404).json({ error: "Conference not found" });
    }

    if (!attendee.conferenceAttendance.has(conferenceId)) {
      // attendee.conferenceAttendance.set(conferenceId, { attended: true });
      return res
        .status(404)
        .json({ error: "Attendee is not registered for the conference" });
    }

    // if attendee is registered for conference
    if (attendee.conferenceAttendance.get(conferenceId).attended) {
      return res
        .status(400)
        .json({ error: "Attendee has already attended the conference" });
    } else {
      attendee.conferenceAttendance.get(conferenceId).attended = true;
      conference.attendees.get(attendee.id).attended = true;
    }

    await attendee.save();

    await conference.save();

    res.status(200).json(attendee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Get all attendees of that conference
router.get("/", async (req, res) => {
  try {
    const conferenceId = req.params.conferenceId;
    const conference = await Conference.findById(conferenceId);
    if (!conference) {
      return res
        .status(400)
        .json({ params: "conferenceId", error: "Conference not found" });
    }

    const attendees = await Attendee.find();
    res.status(200).json(attendees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// use foodCoupon
router.post("/:attendeeId/useFoodCoupon", async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.attendeeId);
    if (!attendee) {
      return res.status(404).json({ error: "Attendee not found" });
    }

    const conferenceId = req.params.conferenceId;
    const conference = await Conference.findById(conferenceId);
    if (!conference) {
      return res.status(404).json({ error: "Conference not found" });
    }

    if (!attendee.foodCouponUsed.has(conferenceId)) {
      return res
        .status(404)
        .json({ error: "Attendee is not registered for the conference" });
    }

    if (
      attendee.foodCouponUsed.get(conferenceId).nextAvailableTime > new Date()
    ) {
      return res.status(400).json({ error: "Food coupon not available yet" });
    }

    // if food coupon is available
    attendee.foodCouponUsed.get(conferenceId).lastdateAndTimeUsed = new Date();
    attendee.foodCouponUsed.get(conferenceId).nextAvailableTime = new Date(
      new Date().getTime() + 180 * 60 * 1000
    ); // 180 minutes in milliseconds

    await attendee.save();

    res.status(200).json(attendee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a specific attendee by ID
router.get("/:id", async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.id);
    if (!attendee) {
      return res.status(404).json({ error: "Attendee not found" });
    }
    res.status(200).json(attendee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an attendee by ID
router.put("/:id", upload.single("photo"), async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.photo = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const attendee = await Attendee.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!attendee) {
      return res.status(404).json({ error: "Attendee not found" });
    }
    res.status(200).json(attendee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an attendee by ID
router.delete("/:id", async (req, res) => {
  try {
    const attendee = await Attendee.findByIdAndDelete(req.params.id);
    if (!attendee) {
      return res.status(404).json({ error: "Attendee not found" });
    }
    res.status(200).json({ message: "Attendee deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// you will get error on doing router.get because we are not sending any response
// Send email to all attendees of the conference
router.post("/sendEmails", async (req, res) => {
  try {
    const conferenceId = req.params.conferenceId;
    // console.log(conferenceId);
    const conference = await Conference.findById(conferenceId);
    if (!conference) {
      return res.status(404).json({ error: "Conference not found" });
    }

    // const attendees = await Attendee.find({
    //   "conferenceAttendance.conferenceId": conferenceId,
    // });

    const attendees_id = Array.from(conference.attendees.keys());
    // console.log(attendees_id);

    if (attendees_id.length === 0) {
      return res
        .status(404)
        .json({ error: "No attendees found for this conference" });
    }

    await sendQRCodesToAllAttendees(attendees_id);

    res.status(200).json({ message: "Emails sent to all attendees" });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message, message: "Error sending emails" });
  }
});


module.exports = router;
