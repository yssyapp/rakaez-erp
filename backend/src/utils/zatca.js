/**
 * ZATCA Phase 1 (simplified tax invoice) QR code generator.
 *
 * This builds the mandatory Base64 TLV (Tag-Length-Value) payload that must
 * be encoded into a QR code on every simplified tax invoice in Saudi Arabia,
 * per ZATCA's e-invoicing regulation. It does NOT talk to the ZATCA/Fatoora
 * API (Phase 2 - integration/reporting), which additionally requires a
 * registered cryptographic certificate, XML invoice signing, and clearance
 * calls to ZATCA's servers. That is a separate, larger integration project.
 *
 * Fields required for the Phase 1 QR (per ZATCA spec):
 *  1. Seller name
 *  2. Seller VAT registration number
 *  3. Invoice timestamp (ISO 8601)
 *  4. Invoice total (with VAT)
 *  5. VAT amount
 */
function tlv(tag, value) {
  const valueBuf = Buffer.from(String(value), "utf8");
  return Buffer.concat([Buffer.from([tag, valueBuf.length]), valueBuf]);
}

export function buildZatcaQrBase64({ sellerName, vatNumber, timestampIso, total, vatAmount }) {
  const buf = Buffer.concat([
    tlv(1, sellerName),
    tlv(2, vatNumber),
    tlv(3, timestampIso),
    tlv(4, Number(total).toFixed(2)),
    tlv(5, Number(vatAmount).toFixed(2)),
  ]);
  return buf.toString("base64");
}
