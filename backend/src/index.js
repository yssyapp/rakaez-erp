import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import partsRouter from "./routes/parts.js";
import salesRouter from "./routes/sales.js";
import adminRouter from "./routes/admin.js";
import billingRouter from "./routes/billing.js";
import authRouter, { authRequired, requireRole } from "./routes/auth.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
// every parts/sales/admin route reads req.user.organizationId to scope its
// queries to one tenant, so all three routers now require a logged-in user —
// there is no "browse without an account" mode in the multi-tenant version,
// since we can't know which shop's catalog to show an anonymous visitor.
app.use("/api/parts", authRequired, partsRouter);
app.use("/api/sales", authRequired, salesRouter);
app.use("/api/admin", authRequired, requireRole("admin"), adminRouter);
app.use("/api/billing", authRequired, billingRouter);

/**
 * GET /pay?amount=<halalas>&description=<text>
 * Serves the hosted Moyasar checkout page loaded by the Flutter mobile app's
 * WebView (see PaymentWebViewScreen). The publishable key is injected here,
 * server-side, from MOYASAR_PUBLISHABLE_KEY so the mobile app never has to
 * embed or configure it itself.
 */
app.get("/pay", (req, res) => {
  const publishableKey = process.env.MOYASAR_PUBLISHABLE_KEY || "";
  const amount = encodeURIComponent(req.query.amount || "0");
  const description = encodeURIComponent(req.query.description || "طلب ركائز");
  // save_card=1 is used by the subscription "activate billing" flow (see
  // billing.js) so Moyasar hands back a REUSABLE token instead of a
  // one-time one — same hosted page, different mode.
  const saveCard = req.query.save_card === "1" ? "1" : "0";
  res.redirect(
    `/pay.html?amount=${amount}&description=${description}&key=${encodeURIComponent(publishableKey)}&save_card=${saveCard}`
  );
});
app.use(express.static(path.join(__dirname, "../public")));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Auto-Parts API running on http://localhost:${port}`));
