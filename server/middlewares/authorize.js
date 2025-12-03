const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.headers["authorization"]?.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: "Token is required",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Invalid or expired token",
      });
    }

    // Store the decoded token (user information) for use in the next middleware/route
    req.user = decoded;

    next();
  });
};

module.exports = { verifyToken };
