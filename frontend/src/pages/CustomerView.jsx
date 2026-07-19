import React, { useState } from "react";
import { searchParts } from "../api/client.js";

export default function CustomerView() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("name");
  const [results, setResults] = useState([]);

  async function onSearch() {
    setResults(await searchParts(q, type));
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="name">بحث بالاسم</option>
          <option value="pn">رقم القطعة</option>
          <option value="vin">رقم الهيكل (VIN)</option>
        </select>
        <input
          style={{ flex: 1, padding: 10 }}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن قطعة..."
        />
        <button onClick={onSearch}>بحث</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
        {results.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <b>{p.name}</b>
            <div style={{ fontSize: 12, color: "#777" }}>{p.brand} · {p.id}</div>
            <div style={{ margin: "8px 0", color: "#16a34a", fontWeight: 700 }}>{p.price} ر.س</div>
            {p.inventory?.map((inv) => (
              <div key={inv.id} style={{ fontSize: 12 }}>
                📍 {inv.branch_name} — قسم {inv.shelf_section} رف {inv.shelf_number} ({inv.shelf_level}) — الكمية: {inv.quantity}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
