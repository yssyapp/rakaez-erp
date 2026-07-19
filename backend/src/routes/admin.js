import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

router.get("/stats", async (req, res) => {
  const orgId = req.user.organizationId;
  const inventoryValue = await pool.query(
    `SELECT COALESCE(SUM(i.quantity * p.cost),0) AS value
     FROM inventory i
     JOIN parts p ON p.id = i.part_id
     JOIN branches b ON b.id = i.branch_id
     WHERE p.organization_id = $1 AND b.organization_id = $1`,
    [orgId]
  );
  const lowStock = await pool.query(
    `SELECT p.id, p.part_number, p.name, i.quantity, i.min_quantity, b.name AS branch_name
     FROM inventory i
     JOIN parts p ON p.id = i.part_id
     JOIN branches b ON b.id = i.branch_id
     WHERE p.organization_id = $1 AND b.organization_id = $1 AND i.quantity < i.min_quantity`,
    [orgId]
  );
  const salesTotal = await pool.query(`SELECT COALESCE(SUM(total),0) AS total FROM invoices WHERE organization_id = $1`, [
    orgId,
  ]);

  res.json({
    inventoryValue: Number(inventoryValue.rows[0].value),
    lowStock: lowStock.rows,
    totalSales: Number(salesTotal.rows[0].total),
  });
});

router.get("/branches-summary", async (req, res) => {
  const orgId = req.user.organizationId;
  const r = await pool.query(
    `SELECT b.id, b.name,
       COUNT(i.id) AS part_count,
       COALESCE(SUM(i.quantity * p.cost),0) AS inventory_value,
       COUNT(*) FILTER (WHERE i.quantity < i.min_quantity) AS low_stock_count
     FROM branches b
     LEFT JOIN inventory i ON i.branch_id = b.id
     LEFT JOIN parts p ON p.id = i.part_id
     WHERE b.organization_id = $1
     GROUP BY b.id, b.name
     ORDER BY b.id`,
    [orgId]
  );
  res.json(r.rows);
});

/** GET /api/admin/organization — the tenant's own profile + subscription status */
router.get("/organization", async (req, res) => {
  const r = await pool.query("SELECT * FROM organizations WHERE id = $1", [req.user.organizationId]);
  res.json(r.rows[0] || null);
});

export default router;
