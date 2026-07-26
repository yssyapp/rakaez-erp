import React, { useEffect, useState } from "react";
import { getAdminStats, getBranchesSummary, getInvoices, getOrganization } from "../api/client.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function TrialBanner({ org, t }) {
  if (!org) return null;
  if (org.subscription_status === "trialing" && org.trial_ends_at) {
    const daysLeft = Math.max(0, Math.ceil((new Date(org.trial_ends_at) - new Date()) / 86400000));
    return (
      <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: 12, marginBottom: 16 }}>
        {t("trial_ends_in")} <b>{org.name}</b> {t("ends_within")} <b>{daysLeft}</b> {t("days")} — {t("current_plan")}: {org.plan}.
      </div>
    );
  }
  if (org.subscription_status === "past_due") {
    return (
      <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: 12, marginBottom: 16 }}>
        {t("payment_overdue")} <b>{org.name}</b> — {t("update_payment_notice")}.
      </div>
    );
  }
  return null;
}

export default function AdminView() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [org, setOrg] = useState(null);

  useEffect(() => {
    getAdminStats().then(setStats);
    getBranchesSummary().then(setBranches);
    getInvoices().then(setInvoices);
    getOrganization().then(setOrg);
  }, []);

  if (!stats) return <p>{t("loading")}</p>;

  return (
    <div>
      <TrialBanner org={org} t={t} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: "#777" }}>{t("inventory_value")}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {stats.inventoryValue.toLocaleString()} {t("sar")}
          </div>
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: "#777" }}>{t("total_sales")}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {stats.totalSales.toLocaleString()} {t("sar")}
          </div>
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: "#777" }}>{t("low_stock_items")}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f59e0b" }}>{stats.lowStock.length}</div>
        </div>
      </div>

      <h3>{t("inventory_by_branch")}</h3>
      <table width="100%">
        <thead>
          <tr>
            <th>{t("col_branch")}</th>
            <th>{t("col_item_count")}</th>
            <th>{t("inventory_value")}</th>
            <th>{t("col_low_stock")}</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((b) => (
            <tr key={b.id}>
              <td>{b.name}</td>
              <td>{b.part_count}</td>
              <td>
                {Number(b.inventory_value).toLocaleString()} {t("sar")}
              </td>
              <td>{b.low_stock_count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{t("recent_invoices")}</h3>
      <table width="100%">
        <thead>
          <tr>
            <th>{t("invoice_number")}</th>
            <th>{t("col_branch")}</th>
            <th>{t("total_label")}</th>
            <th>{t("col_payment")}</th>
            <th>{t("col_zatca_status")}</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((i) => (
            <tr key={i.id}>
              <td>{i.invoice_number}</td>
              <td>{i.branch_name}</td>
              <td>
                {Number(i.total).toFixed(2)} {t("sar")}
              </td>
              <td>{i.payment_status}</td>
              <td>{i.zatca_status === "generated_locally" ? t("zatca_ready_note") : i.zatca_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: "#777" }}>{t("zatca_footnote")}</p>
    </div>
  );
}
