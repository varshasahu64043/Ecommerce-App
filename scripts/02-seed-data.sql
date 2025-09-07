-- Seed data for categories
INSERT INTO categories (name, description, image_url) VALUES
('Electronics', 'Latest gadgets and electronic devices', '/placeholder.svg?height=200&width=200'),
('Clothing', 'Fashion and apparel for all ages', '/placeholder.svg?height=200&width=200'),
('Books', 'Books, magazines and educational content', '/placeholder.svg?height=200&width=200'),
('Home & Garden', 'Home improvement and garden supplies', '/placeholder.svg?height=200&width=200'),
('Sports', 'Sports equipment and fitness gear', '/placeholder.svg?height=200&width=200');

-- Seed data for products
INSERT INTO products (name, description, price, original_price, category_id, image_url, stock_quantity, rating, review_count) VALUES
-- Electronics
('iPhone 15 Pro', 'Latest Apple iPhone with advanced camera system', 999.99, 1099.99, 1, '/placeholder.svg?height=300&width=300', 50, 4.8, 1250),
('Samsung Galaxy S24', 'Flagship Android smartphone with AI features', 899.99, 999.99, 1, '/placeholder.svg?height=300&width=300', 75, 4.7, 980),
('MacBook Air M3', 'Ultra-thin laptop with M3 chip', 1299.99, 1399.99, 1, '/placeholder.svg?height=300&width=300', 30, 4.9, 2100),
('Sony WH-1000XM5', 'Premium noise-canceling headphones', 349.99, 399.99, 1, '/placeholder.svg?height=300&width=300', 100, 4.6, 750),

-- Clothing
('Nike Air Max 270', 'Comfortable running shoes', 149.99, 179.99, 2, '/placeholder.svg?height=300&width=300', 200, 4.5, 890),
('Levi''s 501 Jeans', 'Classic straight-fit denim jeans', 79.99, 89.99, 2, '/placeholder.svg?height=300&width=300', 150, 4.4, 650),
('Adidas Hoodie', 'Comfortable cotton blend hoodie', 59.99, 69.99, 2, '/placeholder.svg?height=300&width=300', 120, 4.3, 420),

-- Books
('The Psychology of Money', 'Financial wisdom and behavioral insights', 16.99, 19.99, 3, '/placeholder.svg?height=300&width=300', 80, 4.7, 1200),
('Atomic Habits', 'Guide to building good habits', 14.99, 17.99, 3, '/placeholder.svg?height=300&width=300', 95, 4.8, 2500),

-- Home & Garden
('Dyson V15 Vacuum', 'Powerful cordless vacuum cleaner', 649.99, 749.99, 4, '/placeholder.svg?height=300&width=300', 25, 4.6, 340),
('Instant Pot Duo', '7-in-1 electric pressure cooker', 89.99, 119.99, 4, '/placeholder.svg?height=300&width=300', 60, 4.5, 890),

-- Sports
('Yoga Mat Premium', 'Non-slip exercise yoga mat', 39.99, 49.99, 5, '/placeholder.svg?height=300&width=300', 180, 4.4, 560),
('Dumbbells Set', 'Adjustable weight dumbbells', 199.99, 249.99, 5, '/placeholder.svg?height=300&width=300', 40, 4.7, 320);
