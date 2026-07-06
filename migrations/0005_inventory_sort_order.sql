ALTER TABLE inventory ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

UPDATE inventory SET sort_order = id WHERE sort_order = 0;

CREATE INDEX IF NOT EXISTS idx_inventory_sort_order ON inventory(sort_order);
