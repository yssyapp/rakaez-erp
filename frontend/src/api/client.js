const BASE = "/api";

export async function searchParts(q, type = "name") {
  const res = await fetch(`${BASE}/parts/search?q=${encodeURIComponent(q)}&type=${type}`);
  return res.json();
}

export async function checkout(branchId, sellerId, items) {
  const res = await fetch(`${BASE}/sales/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ branchId, sellerId, items }),
  });
  return res.json();
}

export async function getAdminStats() {
  const res = await fetch(`${BASE}/admin/stats`);
  return res.json();
}

export async function getBranchesSummary() {
  const res = await fetch(`${BASE}/admin/branches-summary`);
  return res.json();
}

export async function getInvoices() {
  const res = await fetch(`${BASE}/sales/invoices`);
  return res.json();
}
