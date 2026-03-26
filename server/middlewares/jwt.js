import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
};

const generateToken = (payload, options = {}) => {
  const secret = getJwtSecret();
  const jwtOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    ...options,
  };

  return jwt.sign(payload, secret, jwtOptions);
};

const authToken = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Authorization token required." });
  }

  try {
    const secret = getJwtSecret();
    req.user = jwt.verify(token, secret);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

const requireRole = (...roles) => {
  const allowed = roles.map((role) => role.toLowerCase());

  return (req, res, next) => {
    const roleTitle = req.user?.roleTitle?.toLowerCase();

    if (!roleTitle || !allowed.includes(roleTitle)) {
      return res.status(403).json({ message: "Forbidden." });
    }

    return next();
  };
};

export { generateToken, authToken, requireRole };
