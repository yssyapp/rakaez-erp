import React, { useState } from "react";
import CustomerView from "./pages/CustomerView.jsx";
import SellerView from "./pages/SellerView.jsx";
import AdminView from "./pages/AdminView.jsx";

const TABS = [
  { key: "customer", label: "📱 تطبيق العميل", Comp: CustomerView },
  { key: "seller", label: "🧰 البائع / نقاط البيع", Comp: SellerView },
  { key: "admin", label: "📊 لوحة تحكم الإدارة", Comp: AdminView },
];

export default function App() {
  const [tab, setTab] = useState("customer");
  const Active = TABS.find((t) => t.key === tab).Comp;

  return (
    <div style={{ fontFamily: "Segoe UI, Tahoma, sans-serif", maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <h1>🔧 ركائز لقطع غيار السيارات</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: tab === t.key ? "#3b82f6" : "#f2f2f2",
              color: tab === t.key ? "#fff" : "#333",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Active />
    </div>
  );
}
