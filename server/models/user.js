const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password") || this.isNew) {
      const salt = await bcrypt.genSalt(5);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  // return await bcrypt.compare(candidatePassword, this.password);
  try {
    // Use bcrypt to compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    throw err;
  }
};


const User = mongoose.model("User", userSchema);

module.exports = User;
