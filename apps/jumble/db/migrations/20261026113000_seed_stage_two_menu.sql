-- void:allow-destructive
-- Seed the active stage 2 menu. This migration makes the deployed D1 match db/seed.sql.
-- Stage 2: the active weekly menu.
-- Mirrors db/seed.sql for deployed D1.

INSERT OR REPLACE INTO weeks (id, label, starts_on, ends_on, is_active) VALUES
  (1, 'Week of October 26', '2026-10-26', '2026-11-01', 1);

INSERT OR REPLACE INTO flavors (id, slug, name, description, price_cents, color, accent) VALUES
  (1, 'sorrel-snickerdoodle', 'Sorrel Snickerdoodle', 'Cinnamon sugar cookie with a bright sorrel glaze.', 425, '#C94C3D', '#F3D9D2'),
  (2, 'coconut-drops', 'Coconut Drops', 'Toasted coconut, brown sugar, and a chewy center.', 400, '#E8D5B5', '#7A4B2A'),
  (3, 'guava-cheesecake', 'Guava Cheesecake', 'Guava ribbon through a chilled cheesecake cookie.', 450, '#E9A6A0', '#B23A48'),
  (4, 'blue-mountain-brownie', 'Blue Mountain Brownie', 'Dark cocoa, espresso, and a fudgy middle.', 450, '#5A3322', '#D9A45B'),
  (5, 'ginger-beer-crinkle', 'Ginger Beer Crinkle', 'Spiced ginger cookie rolled in cane sugar.', 400, '#E0B15A', '#8A5A2B'),
  (6, 'lime-sugar', 'Lime Sugar', 'Lime zest, cane sugar, and a crisp edge.', 400, '#C7D98A', '#5E7A2E'),
  (7, 'cocoa-crumble', 'Cocoa Crumble', 'Chocolate cookie with a cocoa streusel.', 425, '#8A5A3B', '#4A2A1A'),
  (8, 'mango-chili', 'Mango Chili', 'Sweet mango, a whisper of chili, and sea salt.', 450, '#F0B24A', '#D94F30');

INSERT OR REPLACE INTO week_flavors (id, week_id, flavor_id, sort_order) VALUES
  (1, 1, 1, 1),
  (2, 1, 2, 2),
  (3, 1, 3, 3),
  (4, 1, 4, 4),
  (5, 1, 5, 5),
  (6, 1, 6, 6),
  (7, 1, 7, 7),
  (8, 1, 8, 8);
