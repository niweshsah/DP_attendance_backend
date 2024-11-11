const mongoose = require('mongoose');
require("dotenv").config(); // to use the .env file


// mongo_url = 'mongodb+srv://sahniwesh:Cg1pipueVvULDzdk@testing.4soqq.mongodb.net/hotel_testing_router';
mongo_url = process.env.MONGO_URL || 'mongodb+srv://sahniwesh:Cg1pipueVvULDzdk@testing.4soqq.mongodb.net/attendance_tracker';


mongoose.connect(mongo_url, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error(err);
});

db.once('open', () => {
  console.log('open to MongoDB'); // If we don't get "open to Mongodb" written on console, then we are not connected to the database
});
 

// db.on('connected', () => {
//   console.log('Connected to MongoDB');
// });

db.on('disconnected', () => {
  console.log('Disconnected to MongoDB');
});

module.exports = db;