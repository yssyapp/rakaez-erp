import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireRole } from "./auth.js";
import { createMoyasarPayment } from "../utils/moyasar.js";

const router = Router();

/** GET /api/billing/status — trial/subscription state for the caller's shop */
router.get("/status", async (req, res) => {
  const r = await pool.query(
    `SELECT id, name, plan, plan_price_sar, trial_ends_at, subscription_status,
            (moyasar_card_token IS NOT NULL) AS has_payment_method, next_billing_at
     FROM organizations WHERE id = $1`,
    [req.user.organizationId]
  );
  res.json(r.rows[0] || null);
});

/**
 * POST /api/billing/activate-subscription
 * body: { moyasarToken }
 * Only an org admin can do this (it's the shop's own billing, not a
 * customer's checkout). Charges the plan price ONCE right now, with
 * save_card:true, and stores the resulting reusable token — every future
 * renewal (see scripts/billing-cron.js) reuses that token to charge
 * automatically with zero customer interaction, exactly like a normal app
 * store subscription. The admin can call this any time during or after the
 * 14-day trial to lock in billing before the trial ends.
 */
router.post("/activate-subscription", requireRole("admin"), async (req, res) => {
  const { moyasarToken } = req.body;
  if (!moyasarToken) return res.status(400).json({ error: "missing_payment_token" });

  const orgId = req.user.organizationId;
  const client = await pool.connect();
  try {
    const orgRes = await client.query("SELECT * FROM organizations WHERE id = $1", [orgId]);
    const org = orgRes.rows[0];
    if (!org) return res.status(404).json({ error: "organization_not_found" });

    const payment = await createMoyasarPayment({
      amountHalalas: Math.round(Number(org.plan_price_sar) * 100),
      source: { type: "token", token: moyasarToken },
      description: `اشتراك ركائز - ${org.name} - أول دورة فوترة`,
      saveCard: true, // <- this is what unlocks unattended renewals later
    });

    if (payment.status !== "paid") {
      return res.status(402).json({ error: "payment_not_completed", status: payment.status });
    }

    const reusableToken = payment.source?.token;
    if (!reusableToken) {
      // Charged the customer but Moyasar didn't hand back a reusable token —
      // don't silently pretend recurring billing is set up when it isn't.
      console.error("Moyasar did not return a reusable token despite save_card:true", payment);
      return res.status(500).json({
        error: "no_reusable_token",
        message: "تم الدفع لكن تعذّر حفظ البطاقة للتجديد التلقائي — يرجى المحاولة مرة أخرى أو التواصل مع الدعم.",
      });
    }

    await client.query(
      `UPDATE organizations
       SET moyasar_card_token = $1, subscription_status = 'active', next_billing_at = now() + interval '1 month'
       WHERE id = $2`,
      [reusableToken, orgId]
    );

    res.json({ ok: true, nextBillingAt: null, message: "تم تفعيل الاشتراك — سيتم التجديد تلقائياً كل شهر بدون أي إجراء منك." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "activation_failed" });
  } finally {
    client.release();
  }
});

export default router;
