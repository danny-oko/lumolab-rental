ALTER TABLE inventory ADD COLUMN icon TEXT NOT NULL DEFAULT '📦';

UPDATE inventory SET icon = CASE cat
  WHEN 'ГЭРЭЛ' THEN '💡'
  WHEN 'FIXTURE' THEN '🪩'
  WHEN 'СТЕНД' THEN '🎬'
  WHEN 'БАТТЕРЭЙ' THEN '🔋'
  WHEN 'БУСАД' THEN '📦'
  ELSE '📦'
END;
