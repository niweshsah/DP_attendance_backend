const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const multer = require("multer");

const AttendeeSchema = new Schema({
  name: {
    type: String,
    required: true, // this means the name is required
  },
  designation: {
    type: String,
    required: true,
  },
  mobile: { type: String },

  email: {
    type: String,
    required: true,
    unique: true,
    // this means the email must be unique
  },
  about: {
    type: String,
  },
  conferenceAttendance: {
    type: Map, // conference is the key here
    of: {
      // eventId: { type: mongoose.Schema.Types.ObjectId, ref: "conference" },
      timeIn: { type: Date },
    },
  },

  eventsAttended: {
    type: Map, // Event is the key here
    of: {
      // eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
      timeIn: { type: Date },
    },
  },

  // foodCouponUsed: [
  //   {
  //     conferenceId: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "Conference",
  //     },
  //     // counterWhereUsed: { type: Number },
  //     // Available: { type: Boolean, default: true },
  //     lastDdateAndTimeUsed: [{ type: Date }],
  //     resetTimeInMinutes: { type: Number, default: 180 },
  //     alcohol: { type: Boolean, default: false },
  //     nonVeg: { type: Boolean, default: false },
  //   },
  // ],

  foodCouponUsed: {
    type: Map,
    of: {
      // Removed conferenceId since it becomes the key of the Map
      lastdateAndTimeUsed: {
        type: Date,
        default: "2000-1-1T00:00:00.000Z", // ISO date string
      },
      resetTimeInMinutes: { type: Number, default: 180 },
      alcohol: { type: Boolean, default: false },
      nonVeg: { type: Boolean, default: false },
      nextAvailableTime: {
        type: Date,
        default: "2000-2-22T00:00:00.000Z", // ISO date string; use this date for non-availability
      },
    },
  },
  // array of times when food coupon was availed

  secretQRSTring: {
    type: String,
    required: true,
  },
  photo: {
    data: Buffer,
    contentType: String,
  },
});


// Set up Multer with file size limit and in-memory storage
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Only accept jpg, jpeg, and png files
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Middleware to generate QR code using bcrypt from mobile number and email
AttendeeSchema.pre("save", async function (next) {
  if (this.isModified("mobile") || this.isModified("email")) {
    try {
      const salt = await bcrypt.genSalt(5);
      this.secretQRSTring = await bcrypt.hash(this.mobile + this.email, salt);
      console.log("QR code generated");
    } catch (err) {
      return next(err);
    }
  }
  next();
});


const Attendee = mongoose.model("Attendee", AttendeeSchema); // keep this after the schema is defined

module.exports = Attendee;
module.exports.upload = upload;
