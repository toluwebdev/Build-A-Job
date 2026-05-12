import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized. No token provided." });
      return;
    }

    const raw =
      authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    if (!raw.trim()) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized. No token provided." });
      return;
    }

    const decoded = jwt.verify(raw, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({
      success: false,
      message: "Unauthorized. Invalid token.",
      error: error.message,
    });
  }
};

export default authMiddleware;
