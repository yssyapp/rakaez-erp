import React, { useState } from "react";
import { searchParts, checkout } from "../api/client.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function SellerView() {
  const { t } = useLanguage();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]); // { partId, name, price, quantity }

  async function onSearch() {
    setResults(await searchParts(q, "name"));
  }

  function addToCart(p) {
    setCart((c) => {
      const line = c.find((x) => x.partId === p.id);
      if (line) return c.map((x) => (x.partId === p.id ? { ...x, quantity: x.quantity + 1 } : x));
      return [...c, { partId: p.id, name: p.name, price: Number(p.price), quantity: 1 }];
    });
  }

  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const total = subtotal * 1.15;

  async function onCheckout() {
    const items = cart.map((c) => ({ partId: c.partId, quantity: c.quantity }));
    // branchId is taken from the logged-in seller's account on the server side;
    // passing 1 here is only a fallback used if the account has no branch set.
    const invoice = await checkout(1, items);
    if (invoice.error) {
      alert(`${t("error_prefix")}: ${invoice.error}`);
      return;
    }
    alert(`${t("invoice_issued")} ${invoice.invoice_number}`);
    setCart([]);
    onSearch();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input className="rk-input" style={{ flex: 1 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("seller_search_placeholder")} />
          <button className="rk-btn" onClick={onSearch}>{t("search_btn")}</button>
        </div>
        <table width="100%">
          <thead>
            <tr>
              <th>{t("col_part")}</th>
              <th>{t("col_price")}</th>
              <th>{t("col_location")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {results.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>
                  {p.price} {t("sar")}
                </td>
                <td style={{ fontSize: 12 }}>
                  {p.inventory?.[0] ? `📍 قسم ${p.inventory[0].shelf_section} رف ${p.inventory[0].shelf_number}` : "-"}
                </td>
                <td>
                  <button className="rk-btn" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => addToCart(p)}>{t("add_btn")}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rk-card">
        <h3>{t("invoice_title")}</h3>
        {cart.map((c) => (
          <div key={c.partId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
            <span>{c.name} × {c.quantity}</span>
            <span>{(c.price * c.quantity).toFixed(2)}</span>
          </div>
        ))}
        <hr />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
          <span>{t("total_incl_vat")}</span>
          <span>
            {total.toFixed(2)} {t("sar")}
          </span>
        </div>
        <button className="rk-btn" style={{ width: "100%", marginTop: 10 }} onClick={onCheckout} disabled={!cart.length}>
          {t("checkout_btn")}
        </button>
      </div>
    </div>
  );
}
