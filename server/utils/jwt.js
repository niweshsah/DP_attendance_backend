const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
  const authorization = req.header("Authorization");

  if (!authorization) {
    return res
      .status(401)
      .json({ message: "Access token is missing or invalid" });
  }

  // Extract the jwt token from the request headers
  const token = req.headers.authorization.split(" ")[1]; // this is when token is sent as Bearer token

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // set as 1234

    // Attach user information to the request object so that it can be accessed in the route handler
    req.jwtToken = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Function to generate JWT token
const generateToken = (userData) => {
  // Generate a new JWT token using user data
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1200h' });
};


module.exports = { jwtAuthMiddleware, generateToken };
