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

const listUsers = async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id,
              u.name,
              u.email,
              u.role_id,
              u.profile_picture_id,
              u.address,
              u.notes,
              r.title AS role_title
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       ORDER BY u.id DESC`
    );

    return res.json({ users: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users." });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT u.id,
              u.name,
              u.email,
              u.role_id,
              u.profile_picture_id,
              u.address,
              u.notes,
              r.title AS role_title
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1
       LIMIT 1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user." });
  }
};

const createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    roleId,
    address = null,
    notes = null,
    profilePictureId = null,
  } = req.body || {};

  if (!name || !email || !password || !roleId) {
    return res
      .status(400)
      .json({ message: "Name, email, password, and roleId are required." });
  }

  try {
    const roleResult = await query(
      `SELECT id, title
       FROM roles
       WHERE id = $1
       LIMIT 1`,
      [roleId]
    );

    if (roleResult.rowCount === 0) {
      return res.status(400).json({ message: "Role not found." });
    }

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
       RETURNING id, name, email, role_id, profile_picture_id, address, notes`,
      [name, email, roleId, hashedPassword, profilePictureId, address, notes]
    );

    const user = insertResult.rows[0];

    return res.status(201).json({
      user: {
        ...user,
        role_title: roleResult.rows[0].title,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create user." });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    password,
    roleId,
    address,
    notes,
    profilePictureId,
  } = req.body || {};

  const fields = {
    name,
    email,
    role_id: roleId,
    address,
    notes,
    profile_picture_id: profilePictureId,
  };

  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);

  if (!password && entries.length === 0) {
    return res.status(400).json({ message: "No fields provided to update." });
  }

  try {
    if (email) {
      const emailCheck = await query(
        `SELECT id
         FROM users
         WHERE email = $1 AND id <> $2
         LIMIT 1`,
        [email, id]
      );

      if (emailCheck.rowCount > 0) {
        return res.status(409).json({ message: "Email already exists." });
      }
    }

    if (roleId !== undefined) {
      const roleCheck = await query(
        `SELECT id
         FROM roles
         WHERE id = $1
         LIMIT 1`,
        [roleId]
      );

      if (roleCheck.rowCount === 0) {
        return res.status(400).json({ message: "Role not found." });
      }
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      entries.push(["password", hashedPassword]);
    }

    const setClauses = entries.map(
      ([key], index) => `${key} = $${index + 1}`
    );
    const values = entries.map(([, value]) => value);
    const idParamIndex = values.length + 1;

    const result = await query(
      `UPDATE users
       SET ${setClauses.join(", ")}
       WHERE id = $${idParamIndex}
       RETURNING id, name, email, role_id, profile_picture_id, address, notes`,
      [...values, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const roleResult = await query(
      `SELECT title
       FROM roles
       WHERE id = $1
       LIMIT 1`,
      [result.rows[0].role_id]
    );

    return res.json({
      user: {
        ...result.rows[0],
        role_title: roleResult.rows[0]?.title ?? null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user." });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `DELETE FROM users
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: "User deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user." });
  }
};

export {
  loginUser,
  getMe,
  createTechnician,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
