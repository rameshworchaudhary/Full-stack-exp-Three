const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const header = req.header("Authorization") || req.header("authorization");

  if (!header) {
    return res.status(401).json({
      message: "Access Denied"
    });
  }

  try {
    const token = header.startsWith("Bearer ") ? header.replace("Bearer ", "") : header;
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    req.user = verified;

    next();
  } catch (err) {
    res.status(401).json({
      message: "Invalid Token"
    });
  }
};

module.exports = authMiddleware;