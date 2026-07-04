CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 0,
  cat TEXT NOT NULL,
  no_stand INTEGER NOT NULL DEFAULT 0,
  no_free INTEGER NOT NULL DEFAULT 0,
  is_stand INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rentals (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  return_date TEXT,
  cust_name TEXT NOT NULL,
  cust_reg TEXT NOT NULL DEFAULT '',
  cust_phone TEXT NOT NULL DEFAULT '',
  cust_addr TEXT NOT NULL DEFAULT '',
  cust_deposit TEXT NOT NULL DEFAULT '',
  days REAL NOT NULL,
  dur_label TEXT NOT NULL,
  price_mode TEXT NOT NULL,
  mode_label TEXT NOT NULL,
  gross INTEGER NOT NULL,
  discount INTEGER NOT NULL,
  base INTEGER NOT NULL,
  vat INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('out', 'in'))
);

CREATE TABLE IF NOT EXISTS rental_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rental_id TEXT NOT NULL,
  item_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit INTEGER NOT NULL,
  is_stand INTEGER NOT NULL DEFAULT 0,
  free_stand INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_date ON rentals(date);
CREATE INDEX IF NOT EXISTS idx_rental_items_rental_id ON rental_items(rental_id);
