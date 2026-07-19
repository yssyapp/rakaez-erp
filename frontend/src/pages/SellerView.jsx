import React, { useState } from "react";
import { searchParts, checkout } from "../api/client.js";

export default function SellerView() {
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
    // branchId=1, sellerId=1 are seed values — replace with the logged-in user's branch/id
    const invoice = await checkout(1, 1, items);
    if (invoice.error) {
      alert("خطأ: " + invoice.error);
      return;
    }
    alert("تم إصدار الفاتورة رقم " + invoice.invoice_number);
    setCart([]);
    onSearch();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input style={{ flex: 1, padding: 10 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن قطعة، رقم قطعة، أو VIN" />
          <button onClick={onSearch}>بحث</button>
        </div>
        <table width="100%">
          <thead>
            <tr><th>القطعة</th><th>السعر</th><th>الموقع</th><th></th></tr>
          </thead>
          <tbody>
            {results.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.price} ر.س</td>
                <td style={{ fontSize: 12 }}>
                  {p.inventory?.[0] ? `📍 قسم ${p.inventory[0].shelf_section} رف ${p.inventory[0].shelf_number}` : "-"}
                </td>
                <td><button onClick={() => addToCart(p)}>إضافة</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
        <h3>الفاتورة</h3>
        {cart.map((c) => (
          <div key={c.partId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
            <span>{c.name} × {c.quantity}</span>
            <span>{(c.price * c.quantity).toFixed(2)}</span>
          </div>
        ))}
        <hr />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
          <span>الإجمالي (شامل 15% ضريبة)</span>
          <span>{total.toFixed(2)} ر.س</span>
        </div>
        <button style={{ width: "100%", marginTop: 10, padding: 10 }} onClick={onCheckout} disabled={!cart.length}>
          إتمام البيع
        </button>
      </div>
    </div>
  );
}
