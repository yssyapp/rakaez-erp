-- ركائز — schema (multi-tenant SaaS)
--
-- Every subscribing shop is a separate "organization" (tenant). All
-- business data (branches, parts, inventory, users, invoices) is scoped to
-- one organization_id so two shops' data never mix, even though they share
-- the same database and application. This is the minimum viable isolation
-- model for a SaaS launch — sufficient for dozens to low hundreds of
-- tenants; if the customer base grows much larger, per-tenant database
-- sharding becomes worth revisiting, but organization_id scoping is the
-- right starting point and avoids premature complexity.

CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,                 -- shop/company display name
  vat_number TEXT,                    -- needed on every ZATCA invoice QR
  plan TEXT NOT NULL DEFAULT 'professional', -- basic | professional | business — see PLAN_PRICES in billing.js
  plan_price_sar NUMERIC(10,2) NOT NULL DEFAULT 349,
  trial_ends_at TIMESTAMP,
  subscription_status TEXT NOT NULL DEFAULT 'trialing', -- trialing | active | past_due | canceled
  -- Reusable Moyasar card token saved once (with the customer present, via
  -- the hosted card form + save_card:true) so every renewal after that can
  -- charge automatically with NO customer action — this is what makes
  -- "بدون حضور" (unattended recurring billing) possible.
  moyasar_card_token TEXT,
  next_billing_at TIMESTAMP,
  -- 'monthly' | 'yearly' — set when the admin activates billing, read by
  -- billing-cron.js to know both the renewal amount and how far to push
  -- next_billing_at forward on each successful charge.
  billing_interval TEXT NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT
);

CREATE TABLE parts (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  part_number TEXT NOT NULL,          -- shop-facing part number, e.g. P-1001 (unique PER shop, not globally)
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  price NUMERIC(10,2) NOT NULL,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  UNIQUE(organization_id, part_number)
);

-- inventory: quantity of a part at a specific branch + shelf location
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  part_id INTEGER REFERENCES parts(id) ON DELETE CASCADE,
  branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
  shelf_section TEXT,           -- e.g. 'A'
  shelf_number TEXT,            -- e.g. '5'
  shelf_level TEXT,             -- e.g. 'الدور 2'
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 5,
  UNIQUE(part_id, branch_id)
);

-- VIN compatibility mapping (which parts fit which VIN prefixes / vehicle models)
CREATE TABLE vin_map (
  id SERIAL PRIMARY KEY,
  part_id INTEGER REFERENCES parts(id) ON DELETE CASCADE,
  vin_pattern TEXT NOT NULL,     -- can store a VIN or a VIN prefix pattern
  vehicle_model TEXT,
  vehicle_year_from INT,
  vehicle_year_to INT
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer','seller','admin')),
  branch_id INTEGER REFERENCES branches(id),
  email TEXT NOT NULL,
  password_hash TEXT,
  -- the same email could belong to different people at two different shops,
  -- but must be unique WITHIN a shop's own account list
  UNIQUE(organization_id, email)
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  branch_id INTEGER REFERENCES branches(id),
  seller_id INTEGER REFERENCES users(id),
  subtotal NUMERIC(10,2) NOT NULL,
  vat NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  zatca_status TEXT DEFAULT 'pending', -- pending | submitted | not_integrated | generated_locally
  zatca_qr TEXT,                       -- base64 TLV payload for the ZATCA Phase 1 QR code
  payment_status TEXT DEFAULT 'unpaid', -- unpaid | paid | pos
  payment_reference TEXT,               -- Moyasar payment id, when paid online
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(organization_id, invoice_number)
);

CREATE TABLE invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  part_id INTEGER REFERENCES parts(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_branches_org ON branches(organization_id);
CREATE INDEX idx_parts_org ON parts(organization_id);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_inventory_part ON inventory(part_id);
CREATE INDEX idx_vin_map_pattern ON vin_map(vin_pattern);
