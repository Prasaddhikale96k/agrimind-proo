-- Insert sample farmer
INSERT INTO farmers (name, email, phone, location, farming_experience_years, subscription_plan)
VALUES ('Rajesh Kumar', 'rajesh@agrimind.pro', '+91 98765 43210', 'Maharashtra, India', 12, 'premium')
RETURNING id, name;
