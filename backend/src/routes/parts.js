import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

/**
 * GET /api/parts/search?q=...&type=name|pn|vin
 * Unified search used by the customer app and the seller/POS screen.
 * Every query is scoped to req.user.organizationId (set by the authRequired
 * middleware mounted on /api/parts in index.js) — this is THE critical line
 * standing between "each shop only sees its own catalog" and a serious data
 * leak across tenants, so it appears in every query below, not just once.
 */
router.get("/search", async (req, res) => {
  const { q = "", type = "name" } = req.query;
  const orgId = req.user.organizationId;
  try {
    let rows;
    if (type === "pn") {
      const r = await pool.query(
        `SELECT * FROM parts WHERE organization_id = $1 AND part_number ILIKE $2`,
        [orgId, `%${q}%`]
      );
      rows = r.rows;
    } else if (type === "vin") {
      const r = await pool.query(
        `SELECT p.* FROM parts p
         JOIN vin_map v ON v.part_id = p.id
         WHERE p.organization_id = $1 AND $2 ILIKE v.vin_pattern || '%'`,
        [orgId, q]
      );
      rows = r.rows;
    } else {
      const r = await pool.query(
        `SELECT * FROM parts
         WHERE organization_id = $1 AND (name ILIKE $2 OR brand ILIKE $2 OR category ILIKE $2)`,
        [orgId, `%${q}%`]
      );
      rows = r.rows;
    }

    // attach inventory + shelf location per branch for each part found
    const withInventory = await Promise.all(
      rows.map(async (part) => {
        const inv = await pool.query(
          `SELECT i.*, b.name AS branch_name
           FROM inventory i JOIN branches b ON b.id = i.branch_id
           WHERE i.part_id = $1 AND b.organization_id = $2`,
          [part.id, orgId]
        );
        // the app-facing "id" stays the shop-friendly part_number (e.g. P-1001);
        // the numeric primary key is an internal detail callers don't need
        return { ...part, id: part.part_number, inventory: inv.rows };
      })
    );

    res.json(withInventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "search_failed" });
  }
});

router.get("/", async (req, res) => {
  const r = await pool.query("SELECT * FROM parts WHERE organization_id = $1 ORDER BY name", [
    req.user.organizationId,
  ]);
  res.json(r.rows);
});

export default router;
