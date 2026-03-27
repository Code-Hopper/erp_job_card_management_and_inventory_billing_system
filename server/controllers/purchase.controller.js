import { pool } from "../db/index.js";

const normalizeNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, message: "At least one purchase item is required." };
  }

  for (const [index, item] of items.entries()) {
    const position = index + 1;
    if (!item || !item.productId) {
      return { ok: false, message: `Item ${position} is missing productId.` };
    }
    const quantity = normalizeNumber(item.quantity, NaN);
    const price = normalizeNumber(item.price, NaN);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { ok: false, message: `Item ${position} has invalid quantity.` };
    }
    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, message: `Item ${position} has invalid price.` };
    }
  }

  return { ok: true };
};

const createPurchase = async (req, res) => {
  const {
    supplierId,
    status = "received",
    items = [],
    gstAmount = null,
    totalAmount = null,
  } = req.body || {};

  if (!supplierId) {
    return res.status(400).json({ message: "supplierId is required." });
  }

  const itemsValidation = validateItems(items);
  if (!itemsValidation.ok) {
    return res.status(400).json({ message: itemsValidation.message });
  }

  const purchaseItems = items.map((item) => ({
    productId: item.productId,
    quantity: normalizeNumber(item.quantity, 0),
    price: normalizeNumber(item.price, 0),
    gst: normalizeNumber(item.gst, 0),
  }));

  const computedGst = purchaseItems.reduce((sum, item) => sum + item.gst, 0);
  const computedTotal = purchaseItems.reduce(
    (sum, item) => sum + item.price * item.quantity + item.gst,
    0
  );

  const finalGst = gstAmount === null ? computedGst : normalizeNumber(gstAmount, 0);
  const finalTotal =
    totalAmount === null ? computedTotal : normalizeNumber(totalAmount, 0);

  const addedBy = req.user?.sub ?? null;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const supplierResult = await client.query(
      `SELECT id FROM suppliers WHERE id = $1 LIMIT 1`,
      [supplierId]
    );

    if (supplierResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Supplier not found." });
    }

    const productIds = purchaseItems.map((item) => item.productId);
    const productResult = await client.query(
      `SELECT id FROM products WHERE id = ANY($1::int[])`,
      [productIds]
    );

    if (productResult.rowCount !== productIds.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "One or more products not found." });
    }

    const purchaseResult = await client.query(
      `INSERT INTO purchases (supplier_id, total_amount, gst_amount, status, created_at, added_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, supplier_id, total_amount, gst_amount, status, created_at, added_by`,
      [supplierId, finalTotal, finalGst, status, new Date(), addedBy]
    );

    const purchase = purchaseResult.rows[0];

    for (const item of purchaseItems) {
      await client.query(
        `INSERT INTO purchase_items (purchase_id, product_id, quantity, price, gst)
         VALUES ($1, $2, $3, $4, $5)`,
        [purchase.id, item.productId, item.quantity, item.price, item.gst]
      );

      const inventoryResult = await client.query(
        `SELECT id, quantity
         FROM inventory
         WHERE product_id = $1 AND location IS NULL
         LIMIT 1`,
        [item.productId]
      );

      if (inventoryResult.rowCount === 0) {
        await client.query(
          `INSERT INTO inventory (product_id, quantity, location, last_updated)
           VALUES ($1, $2, $3, $4)`,
          [item.productId, item.quantity, null, new Date()]
        );
      } else {
        const existing = inventoryResult.rows[0];
        const updatedQuantity =
          normalizeNumber(existing.quantity, 0) + item.quantity;
        await client.query(
          `UPDATE inventory
           SET quantity = $1, last_updated = $2
           WHERE id = $3`,
          [updatedQuantity, new Date(), existing.id]
        );
      }

      await client.query(
        `INSERT INTO stock_movements (product_id, type, quantity, reference_type, reference_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [item.productId, "IN", item.quantity, "purchase", purchase.id, new Date()]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      purchase,
      items: purchaseItems,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Failed to create purchase." });
  } finally {
    client.release();
  }
};

const listPurchases = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id,
              p.supplier_id,
              p.total_amount,
              p.gst_amount,
              p.status,
              p.created_at,
              p.added_by,
              s.name AS supplier_name
       FROM purchases p
       LEFT JOIN suppliers s ON s.id = p.supplier_id
       ORDER BY p.id DESC`
    );

    return res.json({ purchases: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch purchases." });
  }
};

const getPurchaseById = async (req, res) => {
  const { id } = req.params;

  try {
    const purchaseResult = await pool.query(
      `SELECT p.id,
              p.supplier_id,
              p.total_amount,
              p.gst_amount,
              p.status,
              p.created_at,
              p.added_by,
              s.name AS supplier_name
       FROM purchases p
       LEFT JOIN suppliers s ON s.id = p.supplier_id
       WHERE p.id = $1
       LIMIT 1`,
      [id]
    );

    if (purchaseResult.rowCount === 0) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    const itemsResult = await pool.query(
      `SELECT id, purchase_id, product_id, quantity, price, gst
       FROM purchase_items
       WHERE purchase_id = $1
       ORDER BY id`,
      [id]
    );

    return res.json({
      purchase: purchaseResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch purchase." });
  }
};

const updatePurchase = async (req, res) => {
  const { id } = req.params;
  const {
    supplierId,
    status,
    gstAmount = null,
    totalAmount = null,
    items,
  } = req.body || {};

  const updateFields = {
    supplier_id: supplierId,
    status,
  };

  const updateEntries = Object.entries(updateFields).filter(
    ([, value]) => value !== undefined
  );

  if (!items && updateEntries.length === 0 && gstAmount === null && totalAmount === null) {
    return res.status(400).json({ message: "No fields provided to update." });
  }

  if (items) {
    const itemsValidation = validateItems(items);
    if (!itemsValidation.ok) {
      return res.status(400).json({ message: itemsValidation.message });
    }
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingPurchase = await client.query(
      `SELECT id FROM purchases WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (existingPurchase.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Purchase not found." });
    }

    if (supplierId !== undefined) {
      const supplierResult = await client.query(
        `SELECT id FROM suppliers WHERE id = $1 LIMIT 1`,
        [supplierId]
      );

      if (supplierResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Supplier not found." });
      }
    }

    if (items) {
      const oldItemsResult = await client.query(
        `SELECT product_id, quantity
         FROM purchase_items
         WHERE purchase_id = $1`,
        [id]
      );

      for (const item of oldItemsResult.rows) {
        const inventoryResult = await client.query(
          `SELECT id, quantity
           FROM inventory
           WHERE product_id = $1 AND location IS NULL
           LIMIT 1`,
          [item.product_id]
        );

        if (inventoryResult.rowCount > 0) {
          const existingQty = normalizeNumber(inventoryResult.rows[0].quantity, 0);
          const updatedQty = existingQty - normalizeNumber(item.quantity, 0);
          await client.query(
            `UPDATE inventory
             SET quantity = $1, last_updated = $2
             WHERE id = $3`,
            [updatedQty, new Date(), inventoryResult.rows[0].id]
          );
        }
      }

      await client.query(
        `DELETE FROM purchase_items WHERE purchase_id = $1`,
        [id]
      );
      await client.query(
        `DELETE FROM stock_movements
         WHERE reference_type = 'purchase' AND reference_id = $1`,
        [id]
      );

      const normalizedItems = items.map((item) => ({
        productId: item.productId,
        quantity: normalizeNumber(item.quantity, 0),
        price: normalizeNumber(item.price, 0),
        gst: normalizeNumber(item.gst, 0),
      }));

      const productIds = normalizedItems.map((item) => item.productId);
      const productResult = await client.query(
        `SELECT id FROM products WHERE id = ANY($1::int[])`,
        [productIds]
      );

      if (productResult.rowCount !== productIds.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "One or more products not found." });
      }

      for (const item of normalizedItems) {
        await client.query(
          `INSERT INTO purchase_items (purchase_id, product_id, quantity, price, gst)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, item.productId, item.quantity, item.price, item.gst]
        );

        const inventoryResult = await client.query(
          `SELECT id, quantity
           FROM inventory
           WHERE product_id = $1 AND location IS NULL
           LIMIT 1`,
          [item.productId]
        );

        if (inventoryResult.rowCount === 0) {
          await client.query(
            `INSERT INTO inventory (product_id, quantity, location, last_updated)
             VALUES ($1, $2, $3, $4)`,
            [item.productId, item.quantity, null, new Date()]
          );
        } else {
          const existingQty = normalizeNumber(inventoryResult.rows[0].quantity, 0);
          const updatedQty = existingQty + item.quantity;
          await client.query(
            `UPDATE inventory
             SET quantity = $1, last_updated = $2
             WHERE id = $3`,
            [updatedQty, new Date(), inventoryResult.rows[0].id]
          );
        }

        await client.query(
          `INSERT INTO stock_movements (product_id, type, quantity, reference_type, reference_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [item.productId, "IN", item.quantity, "purchase", id, new Date()]
        );
      }

      const computedGst = normalizedItems.reduce((sum, item) => sum + item.gst, 0);
      const computedTotal = normalizedItems.reduce(
        (sum, item) => sum + item.price * item.quantity + item.gst,
        0
      );

      updateEntries.push([
        "gst_amount",
        gstAmount === null ? computedGst : normalizeNumber(gstAmount, 0),
      ]);
      updateEntries.push([
        "total_amount",
        totalAmount === null ? computedTotal : normalizeNumber(totalAmount, 0),
      ]);
    } else {
      if (gstAmount !== null) {
        updateEntries.push(["gst_amount", normalizeNumber(gstAmount, 0)]);
      }
      if (totalAmount !== null) {
        updateEntries.push(["total_amount", normalizeNumber(totalAmount, 0)]);
      }
    }

    if (updateEntries.length > 0) {
      const setClauses = updateEntries.map(
        ([key], index) => `${key} = $${index + 1}`
      );
      const values = updateEntries.map(([, value]) => value);
      const idParamIndex = values.length + 1;

      await client.query(
        `UPDATE purchases
         SET ${setClauses.join(", ")}
         WHERE id = $${idParamIndex}`,
        [...values, id]
      );
    }

    await client.query("COMMIT");

    return res.json({ message: "Purchase updated." });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Failed to update purchase." });
  } finally {
    client.release();
  }
};

const deletePurchase = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const purchaseResult = await client.query(
      `SELECT id FROM purchases WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (purchaseResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Purchase not found." });
    }

    const itemsResult = await client.query(
      `SELECT product_id, quantity
       FROM purchase_items
       WHERE purchase_id = $1`,
      [id]
    );

    for (const item of itemsResult.rows) {
      const inventoryResult = await client.query(
        `SELECT id, quantity
         FROM inventory
         WHERE product_id = $1 AND location IS NULL
         LIMIT 1`,
        [item.product_id]
      );

      if (inventoryResult.rowCount > 0) {
        const existingQty = normalizeNumber(inventoryResult.rows[0].quantity, 0);
        const updatedQty = existingQty - normalizeNumber(item.quantity, 0);
        await client.query(
          `UPDATE inventory
           SET quantity = $1, last_updated = $2
           WHERE id = $3`,
          [updatedQty, new Date(), inventoryResult.rows[0].id]
        );
      }
    }

    await client.query(
      `DELETE FROM purchase_items WHERE purchase_id = $1`,
      [id]
    );
    await client.query(
      `DELETE FROM stock_movements
       WHERE reference_type = 'purchase' AND reference_id = $1`,
      [id]
    );
    await client.query(
      `DELETE FROM purchases WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");

    return res.status(200).json({ message: "Purchase deleted." });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Failed to delete purchase." });
  } finally {
    client.release();
  }
};

export { createPurchase, listPurchases, getPurchaseById, updatePurchase, deletePurchase };
