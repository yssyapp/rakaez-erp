import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import partsRouter from "./routes/parts.js";
import salesRouter from "./routes/sales.js";
import adminRouter from "./routes/admin.js";
import billingRouter from "./routes/billing.js";
import authRouter, { authRequired, requireRole } from "./routes/auth.js";

dotenv.config();
const app = express();

// Security headers — cheap to add, no downside, worth having before this
// goes anywhere near the public internet.
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging — helps diagnose issues once this is deployed and we
// can't just watch the terminal live.
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting on /api — a shared limit is fine at this stage; per-tenant
// limits are a future refinement once real traffic patterns are known.
// Login/register get a tighter limit since they're the most abuse-prone.
app.use(
  "/api/",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false })
);
app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })
);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/parts", authRequired, partsRouter);
app.use("/api/sales", authRequired, salesRouter);
app.use("/api/admin", authRequired, requireRole("admin"), adminRouter);
app.use("/api/billing", authRequired, billingRouter);

app.get("/pay", (req, res) => {
  const publishableKey = process.env.MOYASAR_PUBLISHABLE_KEY || "";
  const amount = encodeURIComponent(req.query.amount || "0");
  const description = encodeURIComponent(req.query.description || "طلب ركائز");
  const saveCard = req.query.save_card === "1" ? "1" : "0";
  res.redirect(
    `/pay.html?amount=${amount}&description=${description}&key=${encodeURIComponent(publishableKey)}&save_card=${saveCard}`
  );
});
app.use(express.static(path.join(__dirname, "../public")));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Auto-Parts API running on http://localhost:${port}`));
