import React, { useEffect, useState } from "react";
import { getAdminStats, getBranchesSummary, getInvoices } from "../api/client.js";

export default function AdminView() {
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    getAdminStats().then(setStats);
    getBranchesSummary().then(setBranches);
    getInvoices().then(setInvoices);
  }, []);

  if (!stats) return <p>جارِ التحميل...</p>;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: "#777" }}>قيمة المخزون</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{stats.inventoryValue.toLocaleString()} ر.س</div>
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: "#777" }}>إجمالي المبيعات</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{stats.totalSales.toLocaleString()} ر.س</div>
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: "#777" }}>أصناف تحت الحد الأدنى</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f59e0b" }}>{stats.lowStock.length}</div>
        </div>
      </div>

      <h3>المخزون حسب الفروع</h3>
      <table width="100%">
        <thead><tr><th>الفرع</th><th>عدد الأصناف</th><th>قيمة المخزون</th><th>تحت الحد الأدنى</th></tr></thead>
        <tbody>
          {branches.map((b) => (
            <tr key={b.id}>
              <td>{b.name}</td>
              <td>{b.part_count}</td>
              <td>{Number(b.inventory_value).toLocaleString()} ر.س</td>
              <td>{b.low_stock_count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>آخر الفواتير</h3>
      <table width="100%">
        <thead><tr><th>رقم الفاتورة</th><th>الفرع</th><th>الإجمالي</th><th>حالة ZATCA</th></tr></thead>
        <tbody>
          {invoices.map((i) => (
            <tr key={i.id}>
              <td>{i.invoice_number}</td>
              <td>{i.branch_name}</td>
              <td>{Number(i.total).toFixed(2)} ر.س</td>
              <td>{i.zatca_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
