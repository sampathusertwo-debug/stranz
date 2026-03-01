// CommonJS export for migration scripts
const supabaseSchema = `
-- Vehicle Types Reference Table
CREATE TABLE IF NOT EXISTS vehicle_types (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  typical_capacity_tons DECIMAL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense Categories Reference Table
CREATE TABLE IF NOT EXISTS expense_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Status Types Reference Table
CREATE TABLE IF NOT EXISTS status_types (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations Reference Table
CREATE TABLE IF NOT EXISTS locations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'India',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routes Reference Table
CREATE TABLE IF NOT EXISTS routes (
  id BIGSERIAL PRIMARY KEY,
  from_location_id BIGINT REFERENCES locations(id),
  to_location_id BIGINT REFERENCES locations(id),
  distance_km DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  address TEXT,
  balance DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trucks Table
CREATE TABLE IF NOT EXISTS trucks (
  id BIGSERIAL PRIMARY KEY,
  truck_number TEXT NOT NULL UNIQUE,
  vehicle_type_id BIGINT REFERENCES vehicle_types(id),
  ownership_type TEXT DEFAULT 'MY' CHECK (ownership_type IN ('MY', 'MARKET')),
  capacity_tons DECIMAL,
  driver_id BIGINT REFERENCES drivers(id),
  status TEXT DEFAULT 'available',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parties Table (Clients/Customers)
CREATE TABLE IF NOT EXISTS parties (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  balance DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
  id BIGSERIAL PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  party_id BIGINT NOT NULL REFERENCES parties(id),
  vehicle_type_id BIGINT REFERENCES vehicle_types(id),
  from_location TEXT,
  to_location TEXT,
  material_description TEXT,
  weight_tons DECIMAL,
  quoted_amount DECIMAL,
  valid_until DATE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table (replaces old trips)
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  booking_number TEXT UNIQUE,
  party_id BIGINT NOT NULL REFERENCES parties(id),
  truck_id BIGINT REFERENCES trucks(id),
  driver_id BIGINT REFERENCES drivers(id),
  vehicle_type_id BIGINT REFERENCES vehicle_types(id),
  from_location TEXT,
  to_location TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'booked',
  freight_amount DECIMAL,
  advance_amount DECIMAL DEFAULT 0,
  balance_amount DECIMAL,
  billing_type TEXT DEFAULT 'fixed',
  material_description TEXT,
  weight_tons DECIMAL,
  lr_number TEXT,
  start_odometer_reading DECIMAL,
  end_odometer_reading DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors Table (for vendor vehicles)
CREATE TABLE IF NOT EXISTS vendors (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  alternate_phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  gst_number TEXT,
  pan_number TEXT,
  contact_person TEXT,
  is_active BOOLEAN DEFAULT true,
  balance DECIMAL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Vehicles Table (multiple vehicles per booking)
CREATE TABLE IF NOT EXISTS booking_vehicles (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id),
  vehicle_source TEXT NOT NULL CHECK(vehicle_source IN ('own', 'vendor')),
  truck_id BIGINT REFERENCES trucks(id),
  vendor_id BIGINT REFERENCES vendors(id),
  vehicle_number TEXT,
  driver_id BIGINT REFERENCES drivers(id),
  driver_name TEXT,
  driver_phone TEXT,
  amount DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  party_id BIGINT NOT NULL REFERENCES parties(id),
  booking_id BIGINT REFERENCES bookings(id),
  truck_id BIGINT REFERENCES trucks(id),
  driver_id BIGINT REFERENCES drivers(id),
  from_location TEXT,
  to_location TEXT,
  material TEXT,
  weight DECIMAL,
  freight_amount DECIMAL,
  advance_paid DECIMAL DEFAULT 0,
  balance_amount DECIMAL,
  status TEXT DEFAULT 'pending',
  invoice_date DATE,
  delivery_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT REFERENCES bookings(id),
  truck_id BIGINT REFERENCES trucks(id),
  category_id BIGINT REFERENCES expense_categories(id),
  expense_type TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT,
  expense_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tips Table  
CREATE TABLE IF NOT EXISTS tips (
  id BIGSERIAL PRIMARY KEY,
  driver_id BIGINT NOT NULL REFERENCES drivers(id),
  booking_id BIGINT REFERENCES bookings(id),
  amount DECIMAL NOT NULL,
  description TEXT,
  tip_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trucks_driver ON trucks(driver_id);
CREATE INDEX IF NOT EXISTS idx_trucks_vehicle_type ON trucks(vehicle_type_id);
CREATE INDEX IF NOT EXISTS idx_quotes_party ON quotes(party_id);
CREATE INDEX IF NOT EXISTS idx_quotes_vehicle_type ON quotes(vehicle_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_party ON bookings(party_id);
CREATE INDEX IF NOT EXISTS idx_bookings_truck ON bookings(truck_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_type ON bookings(vehicle_type_id);
CREATE INDEX IF NOT EXISTS idx_booking_vehicles_booking ON booking_vehicles(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_vehicles_truck ON booking_vehicles(truck_id);
CREATE INDEX IF NOT EXISTS idx_booking_vehicles_vendor ON booking_vehicles(vendor_id);
CREATE INDEX IF NOT EXISTS idx_booking_vehicles_driver ON booking_vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party_id);
CREATE INDEX IF NOT EXISTS idx_invoices_booking ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_truck ON invoices(truck_id);
CREATE INDEX IF NOT EXISTS idx_expenses_booking ON expenses(booking_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_tips_driver ON tips(driver_id);
CREATE INDEX IF NOT EXISTS idx_tips_booking ON tips(booking_id);

-- Insert default vehicle types
INSERT INTO vehicle_types (name, code, description, typical_capacity_tons, image_url) VALUES
  ('LCV', 'lcv', 'Light Commercial Vehicle', 1.5, '/images/trucks/lcv.png'),
  ('Open Truck', 'open', 'Open body truck', 5, '/images/trucks/open_truck.png'),
  ('Closed Truck', 'closed', 'Closed/Container truck', 7, '/images/trucks/closed_truck.png'),
  ('Trailer', 'trailer', 'Trailer truck', 20, '/images/trucks/trailer.png'),
  ('Tanker', 'tanker', 'Tanker for liquids', 15, '/images/trucks/tanker.png'),
  ('Tipper', 'tipper', 'Tipper/Dumper truck', 10, '/images/trucks/tipper.png'),
  ('Bus', 'bus', 'Passenger bus', 0, '/images/trucks/bus.png'),
  ('Flatbed', 'flatbed', 'Flatbed truck', 8, '/images/trucks/flatbed.png')
ON CONFLICT (code) DO NOTHING;

-- Insert default expense categories
INSERT INTO expense_categories (name, code, description, is_active) VALUES
  ('Fuel', 'fuel', 'Fuel expenses (Diesel/Petrol)', true),
  ('Toll', 'toll', 'Toll charges', true),
  ('Maintenance', 'maintenance', 'Vehicle maintenance and repairs', true),
  ('Driver Salary', 'driver_salary', 'Driver salary payments', true),
  ('Loading Charges', 'loading', 'Loading and unloading charges', true),
  ('Parking', 'parking', 'Parking charges', true),
  ('Insurance', 'insurance', 'Vehicle insurance', true),
  ('RTO Fees', 'rto', 'RTO and permit fees', true),
  ('Office Rent', 'rent', 'Office rent', true),
  ('Staff Salary', 'salary', 'Office staff salary', true),
  ('Electricity', 'electricity', 'Electricity bill', true),
  ('Internet', 'internet', 'Internet and phone bill', true),
  ('Stationery', 'stationery', 'Office stationery', true),
  ('Miscellaneous', 'misc', 'Other miscellaneous expenses', true)
ON Cbooking', 'Booked', 'booked', 'Booking confirmed', 1),
  ('booking', 'In Transit', 'in_transit', 'Booking in progress', 2),
  ('booking', 'Completed', 'completed', 'Booking completed', 3),
  ('booking', 'Cancelled', 'cancelled', 'Bookingcode, description, display_order) VALUES
  ('trip', 'Booked', 'booked', 'Trip booked', 1),
  ('trip', 'In Transit', 'in_transit', 'Trip in progress', 2),
  ('trip', 'Completed', 'completed', 'Trip completed', 3),
  ('trip', 'Cancelled', 'cancelled', 'Trip cancelled', 4),
  ('invoice', 'Pending', 'pending', 'Invoice pending', 1),
  ('invoice', 'Partial', 'partial', 'Partially paid', 2),
  ('invoice', 'Paid', 'paid', 'Fully paid', 3),
  ('invoice', 'Overdue', 'overdue', 'Payment overdue', 4),
  ('truck', 'Available', 'available', 'Truck available for booking', 1),
  ('truck', 'On Trip', 'on_trip', 'Truck on active trip', 2),
  ('truck', 'Maintenance', 'maintenance', 'Under maintenance', 3),
  ('truck', 'Inactive', 'inactive', 'Not in service', 4),
  ('quote', 'Pending', 'quote_pending', 'Quote sent, awaiting response', 1),
  ('quote', 'Accepted', 'quote_accepted', 'Quote accepted by customer', 2),
  ('quote', 'Rejected', 'quote_rejected', 'Quote rejected', 3),
  ('quote', 'Expired', 'quote_expired', 'Quote validity expired', 4)
ON CONFLICT (code) DO NOTHING;
`;

module.exports = { supabaseSchema };
