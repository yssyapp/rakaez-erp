/**
 * Recurring subscription billing — run this once a day on a schedule
 * (system cron, or a hosted scheduler like Railway Cron / GitHub Actions
 * cron once the backend is deployed). It is intentionally a standalone
 * script, not an HTTP endpoint, so it can never be triggered by a stray web
 * request — only by whatever schedules it on the server.
 *
 * What it does, in order, for every organization:
 *
 * 1. Trial expired with NO saved payment method → mark subscription
 *    'past_due' so the app can show a "add payment method" banner. We do
 *    NOT lock the account out immediately; that's a product decision you
 *    can tighten later (e.g. read-only mode after N days past_due).
 *
 * 2. Active subscription whose next_billing_at has arrived AND a saved
 *    card token exists → charge the org automatically using that saved
 *    token (source: {type:'token', token: ...}) with NO customer present,
 *    exactly like Apple/Google subscription renewals. The amount and how
 *    far next_billing_at moves forward both depend on billing_interval:
 *    'monthly' charges plan_price_sar and adds 1 month; 'yearly' charges
 *    10x plan_price_sar (see YEARLY_MONTHS_CHARGED in billing.js — kept in
 *    sync here) and adds 1 year. On failure (card declined, expired, etc.),
 *    mark 'past_due' instead of silently retrying forever.
 *
 * Run manually to test: `node scripts/billing-cron.js`
 * Example crontab entry (once daily at 3am): 0 3 * * * cd /path/to/backend && node scripts/billing-cron.js >> billing.log 2>&1
 */
import dotenv from "dotenv";
import { pool } from "../src/db/pool.js";
import { createMoyasarPayment } from "../src/utils/moyasar.js";

dotenv.config();

// Kept identical to billing.js's YEARLY_MONTHS_CHARGED on purpose — a yearly
// renewal must charge the same amount as a fresh yearly activation would.
const YEARLY_MONTHS_CHARGED = 10;

async function markTrialsExpiredWithoutPayment() {
  const r = await pool.query(
    `UPDATE organizations
     SET subscription_status = 'past_due'
     WHERE subscription_status = 'trialing'
       AND trial_ends_at IS NOT NULL AND trial_ends_at < now()
       AND moyasar_card_token IS NULL
     RETURNING id, name`
  );
  for (const org of r.rows) {
    console.log(`[billing-cron] trial expired without payment method: org ${org.id} (${org.name}) -> past_due`);
  }
}

async function chargeDueRenewals() {
  const due = await pool.query(
    `SELECT * FROM organizations
     WHERE subscription_status = 'active'
       AND moyasar_card_token IS NOT NULL
       AND next_billing_at IS NOT NULL AND next_billing_at < now()`
  );

  for (const org of due.rows) {
    const isYearly = org.billing_interval === "yearly";
    const amountSar = isYearly ? Number(org.plan_price_sar) * YEARLY_MONTHS_CHARGED : Number(org.plan_price_sar);
    const intervalSql = isYearly ? "interval '1 year'" : "interval '1 month'";

    try {
      const payment = await createMoyasarPayment({
        amountHalalas: Math.round(amountSar * 100),
        source: { type: "token", token: org.moyasar_card_token },
        description: `تجديد اشتراك ركائز - ${org.name} - ${isYearly ? "سنوي" : "شهري"}`,
      });

      if (payment.status === "paid") {
        await pool.query(
          `UPDATE organizations SET next_billing_at = next_billing_at + ${intervalSql}, subscription_status = 'active' WHERE id = $1`,
          [org.id]
        );
        console.log(`[billing-cron] renewed org ${org.id} (${org.name}, ${org.billing_interval}) successfully`);
      } else {
        await pool.query(`UPDATE organizations SET subscription_status = 'past_due' WHERE id = $1`, [org.id]);
        console.warn(`[billing-cron] renewal not paid for org ${org.id} (${org.name}): status=${payment.status}`);
      }
    } catch (err) {
      await pool.query(`UPDATE organizations SET subscription_status = 'past_due' WHERE id = $1`, [org.id]);
      console.error(`[billing-cron] renewal FAILED for org ${org.id} (${org.name}):`, err.message);
      // NOTE: no automatic retry loop here on purpose — retrying a declined
      // card immediately rarely helps and can trigger fraud flags. A real
      // dunning flow (retry in 3 days, then 7, then cancel) is the next
      // step once this basic version is proven working.
    }
  }
}

async function main() {
  console.log(`[billing-cron] run started ${new Date().toISOString()}`);
  await markTrialsExpiredWithoutPayment();
  await chargeDueRenewals();
  console.log(`[billing-cron] run finished`);
  await pool.end();
}

main().catch((err) => {
  console.error("[billing-cron] fatal error:", err);
  process.exit(1);
});
