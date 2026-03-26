import bcrypt from "bcryptjs";
import { generateToken } from "../middlewares/jwt.js";
import { query } from "../db/index.js";

const buildTokenPayload = (user) => ({
  sub: user.id,
  email: user.email,
  role: user.role,
  roleTitle: user.roleTitle,
});

const isBcryptHash = (value) =>
  typeof value === "string" && value.startsWith("$2") && value.length >= 59;

const getRoleContext = (roleTitle) => {
  const normalized = (roleTitle || "").toLowerCase();

  if (normalized === "admin") {
    return {
      landing: "/admin",
      capabilities: ["manage_users", "manage_inventory", "manage_job_cards"],
    };
  }

  if (normalized === "technician") {
    return {
      landing: "/technician",
      capabilities: ["view_job_cards", "update_job_status"],
    };
  }

  return {
    landing: "/dashboard",
    capabilities: ["view_dashboard"],
  };
};

const loginUser = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role_id, u.password, r.title AS role_title
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.email = $1
       LIMIT 1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = result.rows[0];

    console.log(user)

    const passwordMatches = isBcryptHash(user.password)
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const roleContext = getRoleContext(user.role_title);
    const token = generateToken(
      buildTokenPayload({
        id: user.id,
        email: user.email,
        role: user.role_id,
        roleTitle: user.role_title,
      })
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_id,
        roleTitle: user.role_title,
      },
      roleContext,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Login failed.", error });
  }
};

const getMe = async (req, res) => {
  const userId = req.user?.sub;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role_id, r.title AS role_title
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1
       LIMIT 1`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = result.rows[0];

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_id,
        roleTitle: user.role_title,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user." });
  }
};

const createTechnician = async (req, res) => {
  const {
    name,
    email,
    password,
    address = null,
    notes = null,
    profilePictureId = null,
  } = req.body || {};

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });
  }

  try {
    const roleResult = await query(
      `SELECT id, title
       FROM roles
       WHERE LOWER(title) = 'technician'
       LIMIT 1`
    );

    if (roleResult.rowCount === 0) {
      return res
        .status(400)
        .json({ message: "Technician role is not configured." });
    }

    const technicianRole = roleResult.rows[0];

    const existingUser = await query(
      `SELECT id
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await query(
      `INSERT INTO users (name, email, role_id, password, profile_picture_id, address, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role_id`,
      [
        name,
        email,
        technicianRole.id,
        hashedPassword,
        profilePictureId,
        address,
        notes,
      ]
    );

    const user = insertResult.rows[0];

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_id,
        roleTitle: technicianRole.title,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create technician." });
  }
};

export { loginUser, getMe, createTechnician };
