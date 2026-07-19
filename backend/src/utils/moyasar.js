/**
 * Minimal Moyasar payment gateway client (Saudi-focused card/Mada/Apple Pay
 * processor). Docs: https://docs.moyasar.com
 *
 * Flow used here:
 *  1. Frontend collects card details with Moyasar.js (never touches our
 *     backend) and gets back a one-time `source.token` / uses Moyasar's
 *     hosted card form to create a payment token.
 *  2. Frontend sends { token, amount, invoiceDraft } to our backend.
 *  3. Backend calls POST /v1/payments with the secret key (server-side only)
 *     to actually charge the card, then creates the invoice only if the
 *     charge succeeded.
 *
 * Requires MOYASAR_SECRET_KEY in the environment. Without it, checkout will
 * fail loudly instead of silently pretending to charge the customer.
 */
const MOYASAR_API = "https://api.moyasar.com/v1";

export async function createMoyasarPayment({ amountHalalas, source, description, currency = "SAR", saveCard = false }) {
  const secretKey = process.env.MOYASAR_SECRET_KEY;
  if (!secretKey) {
    throw new Error("moyasar_not_configured");
  }

  const res = await fetch(`${MOYASAR_API}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${secretKey}:`).toString("base64"),
    },
    body: JSON.stringify({
      amount: amountHalalas, // Moyasar amounts are in halalas (SAR * 100)
      currency,
      description,
      source, // { type: 'token', token: '<token from Moyasar.js, or a previously saved reusable token>' }
      // save_card:true makes Moyasar return a REUSABLE token on the response
      // (payment.source.token) that can charge this same card again later
      // with no card re-entry — this is what makes unattended recurring
      // subscription billing possible. Only set this on the FIRST charge of
      // a subscription (see routes/billing.js); every renewal after that
      // reuses the saved token as `source` without saveCard again.
      save_card: saveCard,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || "payment_failed";
    throw new Error(message);
  }
  return data; // includes id, status ('paid' | 'failed' | ...), source.token (reusable if saveCard was true), etc.
}

/**
 * Refunds a previously captured payment. Used when a card charge succeeds
 * but we then fail to reserve inventory (race condition: someone else sold
 * the last unit between price-check and stock update) — the customer must
 * not be left charged for an order we can't actually fulfill.
 */
export async function refundMoyasarPayment(paymentId, amountHalalas) {
  const secretKey = process.env.MOYASAR_SECRET_KEY;
  if (!secretKey) throw new Error("moyasar_not_configured");

  const res = await fetch(`${MOYASAR_API}/payments/${paymentId}/refund`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${secretKey}:`).toString("base64"),
    },
    body: JSON.stringify({ amount: amountHalalas }),
  });

  const data = await res.json();
  if (!res.ok) {
    // Surface but don't throw — the caller is already in an error path and
    // needs to know refund failed too, without masking the original error.
    console.error("Moyasar refund failed:", data);
    return { ok: false, data };
  }
  return { ok: true, data };
}
