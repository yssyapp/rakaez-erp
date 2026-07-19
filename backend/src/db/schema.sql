npm install
npm run dev-- Smart Auto-Parts ERP - schema

CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT
);

CREATE TABLE parts (
  id TEXT PRIMARY KEY,          -- part number, e.g. P-1001
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  price NUMERIC(10,2) NOT NULL,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- inventory: quantity of a part at a specific branch + shelf location
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  part_id TEXT REFERENCES parts(id) ON DELETE CASCADE,
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
  part_id TEXT REFERENCES parts(id) ON DELETE CASCADE,
  vin_pattern TEXT NOT NULL,     -- can store a VIN or a VIN prefix pattern
  vehicle_model TEXT,
  vehicle_year_from INT,
  vehicle_year_to INT
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer','seller','admin')),
  branch_id INTEGER REFERENCES branches(id),
  email TEXT UNIQUE,
  password_hash TEXT
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  branch_id INTEGER REFERENCES branches(id),
  seller_id INTEGER REFERENCES users(id),
  subtotal NUMERIC(10,2) NOT NULL,
  vat NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  zatca_status TEXT DEFAULT 'pending', -- pending | submitted | not_integrated
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  part_id TEXT REFERENCES parts(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_inventory_part ON inventory(part_id);
CREATE INDEX idx_vin_map_pattern ON vin_map(vin_pattern);
