-- =====================================
-- USERS
-- =====================================
INSERT INTO users (id, account_type, email, password) VALUES
(1, 'ARTIST', 'anna@example.com', 'anna1234'),
(2, 'ARTIST', 'bjorn@example.com', 'bjorn1234'),
(3, 'ARTIST', 'carl@example.com', 'carl1234');

-- =====================================
-- ARTISTS
-- =====================================
INSERT INTO artists (id, user_id, first_name, last_name, bio, style, image_url) VALUES
(1, 1, 'Anna', 'Larsen', 'Contemporary artist from Copenhagen.', 'Contemporary', 'https://picsum.photos/seed/artist1/400/400'),
(2, 2, 'Bjorn', 'Hansen', 'Abstract painter focusing on colors.', 'Abstract','https://picsum.photos/seed/artist2/400/400'),
(3, 3, 'Carl', 'Nielsen', 'Sculptor working with mixed materials.', 'Sculpture', 'https://picsum.photos/seed/artist3/400/400');

-- =====================================
-- PRODUCTS
-- =====================================

-- Anna's 10 Products
INSERT INTO products (id, title, secret_price, currency, image_url, sold, artist_id, description, year_created, product_size, date_added) VALUES
(1, 'Silent Harbour', 850, 'DKK', 'https://picsum.photos/seed/art1/600/400', 0, 1, 'Ink on paper work.', 2020, '50x70 cm', '2025-01-01'),
(2, 'Blue Echoes', 920, 'DKK', 'https://picsum.photos/seed/art2/600/400', 0, 1, 'Acrylic painting.', 2019, '60x80 cm', '2025-01-02'),
(3, 'Morning Light', 750, 'DKK', 'https://picsum.photos/seed/art3/600/400', 0, 1, 'Watercolor painting.', 2021, '40x60 cm', '2025-01-03'),
(4, 'Autumn Breeze', 680, 'DKK', 'https://picsum.photos/seed/art4/600/400', 0, 1, 'Oil on canvas.', 2018, '50x70 cm', '2025-01-04'),
(5, 'Winter Calm', 900, 'DKK', 'https://picsum.photos/seed/art5/600/400', 0, 1, 'Mixed media painting.', 2022, '60x90 cm', '2025-01-05'),
(6, 'Sunset Dream', 810, 'DKK', 'https://picsum.photos/seed/art6/600/400', 0, 1, 'Acrylic painting.', 2020, '50x75 cm', '2025-01-06'),
(7, 'Forest Whisper', 700, 'DKK', 'https://picsum.photos/seed/art7/600/400', 0, 1, 'Oil on canvas.', 2019, '55x75 cm', '2025-01-07'),
(8, 'City Lights', 820, 'DKK', 'https://picsum.photos/seed/art8/600/400', 0, 1, 'Ink and watercolor.', 2021, '60x80 cm', '2025-01-08'),
(9, 'Ocean Waves', 880, 'DKK', 'https://picsum.photos/seed/art9/600/400', 0, 1, 'Acrylic painting.', 2022, '70x100 cm', '2025-01-09'),
(10, 'Golden Horizon', 950, 'DKK', 'https://picsum.photos/seed/art10/600/400', 0, 1, 'Oil on canvas.', 2021, '65x85 cm', '2025-01-10');

-- Bjorn's 10 Products
INSERT INTO products (id, title, secret_price, currency, image_url, sold, artist_id, description, year_created, product_size, date_added) VALUES
(11, 'Abstract Flow', 720, 'DKK', 'https://picsum.photos/seed/art11/600/400', 0, 2, 'Abstract acrylic painting.', 2020, '70x90 cm', '2025-01-11'),
(12, 'Color Symphony', 650, 'DKK', 'https://picsum.photos/seed/art12/600/400', 0, 2, 'Oil on canvas.', 2019, '60x80 cm', '2025-01-12'),
(13, 'Dynamic Lines', 780, 'DKK', 'https://picsum.photos/seed/art13/600/400', 0, 2, 'Geometric abstract.', 2021, '50x70 cm', '2025-01-13'),
(14, 'Silent Rhythm', 690, 'DKK', 'https://picsum.photos/seed/art14/600/400', 0, 2, 'Modern abstract.', 2020, '55x75 cm', '2025-01-14'),
(15, 'Color Burst', 720, 'DKK', 'https://picsum.photos/seed/art15/600/400', 0, 2, 'Acrylic abstract.', 2022, '60x80 cm', '2025-01-15'),
(16, 'Vivid Dreams', 850, 'DKK', 'https://picsum.photos/seed/art16/600/400', 0, 2, 'Oil painting.', 2021, '65x85 cm', '2025-01-16'),
(17, 'Eternal Motion', 780, 'DKK', 'https://picsum.photos/seed/art17/600/400', 0, 2, 'Acrylic abstract.', 2020, '70x90 cm', '2025-01-17'),
(18, 'Shifting Colors', 690, 'DKK', 'https://picsum.photos/seed/art18/600/400', 0, 2, 'Oil and acrylic mix.', 2019, '60x80 cm', '2025-01-18'),
(19, 'Fragmented Thoughts', 820, 'DKK', 'https://picsum.photos/seed/art19/600/400', 0, 2, 'Abstract acrylic painting.', 2021, '65x85 cm', '2025-01-19'),
(20, 'Silent Echo', 880, 'DKK', 'https://picsum.photos/seed/art20/600/400', 0, 2, 'Oil on canvas.', 2022, '70x100 cm', '2025-01-20');

-- Carl's 10 Products
INSERT INTO products (id, title, secret_price, currency, image_url, sold, artist_id, description, year_created, product_size, date_added) VALUES
(21, 'Sculpted Form', 920, 'DKK', 'https://picsum.photos/seed/art21/600/400', 0, 3, 'Bronze sculpture.', 2018, '120x80x60 cm', '2025-01-21'),
(22, 'Twisted Reality', 870, 'DKK', 'https://picsum.photos/seed/art22/600/400', 0, 3, 'Mixed materials sculpture.', 2019, '110x70x50 cm', '2025-01-22'),
(23, 'Stone Whisper', 910, 'DKK', 'https://picsum.photos/seed/art23/600/400', 0, 3, 'Stone carving.', 2020, '100x60x40 cm', '2025-01-23'),
(24, 'Metallic Dream', 850, 'DKK', 'https://picsum.photos/seed/art24/600/400', 0, 3, 'Metal sculpture.', 2021, '90x50x40 cm', '2025-01-24'),
(25, 'Fluid Motion', 880, 'DKK', 'https://picsum.photos/seed/art25/600/400', 0, 3, 'Abstract sculpture.', 2020, '95x55x45 cm', '2025-01-25'),
(26, 'Eternal Form', 910, 'DKK', 'https://picsum.photos/seed/art26/600/400', 0, 3, 'Bronze and stone.', 2019, '110x70x60 cm', '2025-01-26'),
(27, 'Twilight Shadows', 860, 'DKK', 'https://picsum.photos/seed/art27/600/400', 0, 3, 'Mixed materials.', 2021, '100x60x50 cm', '2025-01-27'),
(28, 'Silent Structure', 900, 'DKK', 'https://picsum.photos/seed/art28/600/400', 0, 3, 'Stone sculpture.', 2022, '105x65x55 cm', '2025-01-28'),
(29, 'Golden Twist', 920, 'DKK', 'https://picsum.photos/seed/art29/600/400', 0, 3, 'Bronze sculpture.', 2020, '120x80x60 cm', '2025-01-29'),
(30, 'Frozen Time', 950, 'DKK', 'https://picsum.photos/seed/art30/600/400', 0, 3, 'Metal and stone sculpture.', 2021, '110x70x60 cm', '2025-01-30');
