const express = require("express");
const router = express.Router({ mergeParams: true }); // Important to merge params from the parent route
const User = require("../models/user");
const Attendee = require("../models/attendee");
const { jwtAuthMiddleware, generateToken } = require("../utils/jwt");
// const Conference = require('../models/conference');

// POST route to add a person
router.post("/signup", async (req, res) => {
  try {
    const data = req.body; // Assuming the request body contains the person data

    // Create a new Person document using the Mongoose model
    const newUser = new User(data);

    // Save the new person to the database
    const response = await newUser.save();
    console.log("data saved");

    const payload = {
      id: response.id,
      username: response.username,
    };

    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is : ", token);

    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    // Extract username and password from request body
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username: username });

    // If user does not exist or password does not match, return error
    if (!user) {
      return res.status(401).json({ error: "Invalid username" });
    }
    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // generate Token
    const payload = {
      id: user.id,
      username: user.username,
    };
    const token = generateToken(payload);

    // resturn token as response
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Profile route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const tokenData = req.jwtToken;
    console.log("User Data: ", tokenData);

    const userId = tokenData.id;
    const user = await User.findById(userId);

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/userTesting", async (req, res) => {
  try {
    // const users = await User.find();
    res.status(200).json({ error: "testing" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/addNewAttendee", async (req, res) => {
  try {
    // const data = req.body; // Assuming the request body contains the person data

    const data = {
      name: req.body.name,
      designation: req.body.designation,
      mobile: req.body.mobile,
      email: req.body.email,
      about: req.body.about,
      conferenceAttendance: req.body.conferenceAttendance,
      eventsAttended: req.body.eventsAttended,
      foodCouponUsed: req.body.foodCouponUsed,
      secretQRSTring: req.body.secretQRSTring,
      photo: req.body.photo,
    };

    // Check if the email is already registered
    const existingAttendee = await Attendee.findOne({ email: data.email });
    if (existingAttendee) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    
    const existingAttendee2 = await Attendee.findOne({ mobile: data.mobile });
    if (existingAttendee) {
      return res.status(400).json({ error: "Mobile is already registered" });
    }

    // Create a new Person document using the Mongoose model
    const newAttendee = new Attendee(data);

    // Save the new person to the database
    const response = await newAttendee.save();
    console.log("data saved");

    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to add new attendee" });
  }
});

const conferenceRoutes = require("./conferenceRoute"); // Import the conference route
router.use("/conference", conferenceRoutes); // use the conferenceRoutes
// Add jwt middleware to the route

module.exports = router; // Export the router
