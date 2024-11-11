const express = require("express"); // importing express
const app = express(); // create a new instance of express
const db = require("./db"); // importing db.js
require("dotenv").config(); // to use the .env file

const port = process.env.PORT || 27017; // set the port number

const bodyParser = require("body-parser"); // importing body-parser
app.use(bodyParser.json()); // use body-parser


app.get('/', (req, res) => {
  res.send('DP project is running!');
});

const userRoutes = require('./routes/userRoute'); // Import the conference route
app.use('/user', userRoutes); // use the conferenceRoutes

// const 

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});