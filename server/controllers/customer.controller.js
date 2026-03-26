import { query } from "../db/index.js";

const createCustomer = async (req, res) => {
  const {
    name,
    email = null,
    phone = null,
    address = null,
    gstn = null,
    type = null,
    notes = null,
    gender = null,
  } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: "Name is required." });
  }

  const addedBy = req.user?.sub ?? null;

  try {
    const result = await query(
      `INSERT INTO customers (name, email, phone, address, gstn, type, notes, gender, added_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, email, phone, address, gstn, type, notes, gender, added_by`,
      [name, email, phone, address, gstn, type, notes, gender, addedBy]
    );

    return res.status(201).json({ customer: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create customer." });
  }
};

const listCustomers = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, phone, address, gstn, type, notes, gender, added_by
       FROM customers
       ORDER BY id DESC`
    );

    return res.json({ customers: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch customers." });
  }
};

const getCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT id, name, email, phone, address, gstn, type, notes, gender, added_by
       FROM customers
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    return res.json({ customer: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch customer." });
  }
};

const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phone,
    address,
    gstn,
    type,
    notes,
    gender,
  } = req.body || {};

  const fields = { name, email, phone, address, gstn, type, notes, gender };
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);

  if (entries.length === 0) {
    return res.status(400).json({ message: "No fields provided to update." });
  }

  const setClauses = entries.map(
    ([key], index) => `${key} = $${index + 1}`
  );
  const values = entries.map(([, value]) => value);
  const idParamIndex = values.length + 1;

  try {
    const result = await query(
      `UPDATE customers
       SET ${setClauses.join(", ")}
       WHERE id = $${idParamIndex}
       RETURNING id, name, email, phone, address, gstn, type, notes, gender, added_by`,
      [...values, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    return res.json({ customer: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update customer." });
  }
};

const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `DELETE FROM customers
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    return res.status(200).json({ message: "Customer deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete customer." });
  }
};

export {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
