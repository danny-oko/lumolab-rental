CREATE TABLE IF NOT EXISTS categories (
  name TEXT PRIMARY KEY,
  emoji TEXT NOT NULL DEFAULT '📁',
  sort_order INTEGER NOT NULL,
  builtin INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO categories (name, emoji, sort_order, builtin) VALUES
  ('ГЭРЭЛ', '💡', 0, 1),
  ('FIXTURE', '🪩', 1, 1),
  ('СТЕНД', '🎬', 2, 1),
  ('БАТТЕРЭЙ', '🔋', 3, 1),
  ('БУСАД', '📦', 4, 1);

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
