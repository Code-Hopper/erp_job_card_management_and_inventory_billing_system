import { query } from "../db/index.js";

const createSupplier = async (req, res) => {
  const {
    name,
    phone = null,
    email = null,
    gstn = null,
    address = null,
    bankAccountNo = null,
    bankIfsc = null,
  } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: "Name is required." });
  }

  const addedBy = req.user?.sub ?? null;

  try {
    const result = await query(
      `INSERT INTO suppliers (name, phone, email, gstn, address, bank_account_no, bank_ifsc, added_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, phone, email, gstn, address, bank_account_no, bank_ifsc, added_by`,
      [name, phone, email, gstn, address, bankAccountNo, bankIfsc, addedBy]
    );

    return res.status(201).json({ supplier: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create supplier." });
  }
};

const listSuppliers = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, phone, email, gstn, address, bank_account_no, bank_ifsc, added_by
       FROM suppliers
       ORDER BY id DESC`
    );

    return res.json({ suppliers: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch suppliers." });
  }
};

const getSupplierById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT id, name, phone, email, gstn, address, bank_account_no, bank_ifsc, added_by
       FROM suppliers
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    return res.json({ supplier: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch supplier." });
  }
};

const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    phone,
    email,
    gstn,
    address,
    bankAccountNo,
    bankIfsc,
  } = req.body || {};

  const fields = {
    name,
    phone,
    email,
    gstn,
    address,
    bank_account_no: bankAccountNo,
    bank_ifsc: bankIfsc,
  };

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
      `UPDATE suppliers
       SET ${setClauses.join(", ")}
       WHERE id = $${idParamIndex}
       RETURNING id, name, phone, email, gstn, address, bank_account_no, bank_ifsc, added_by`,
      [...values, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    return res.json({ supplier: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update supplier." });
  }
};

const deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `DELETE FROM suppliers
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    return res.status(200).json({ message: "Supplier deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete supplier." });
  }
};

export {
  createSupplier,
  listSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
