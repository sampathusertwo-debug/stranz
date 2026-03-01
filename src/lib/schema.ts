export const schema = `
-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trucks Table
CREATE TABLE IF NOT EXISTS trucks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  truck_number TEXT NOT NULL UNIQUE,
  truck_type TEXT,
  capacity REAL,
  driver_id INTEGER,
  status TEXT DEFAULT 'available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Parties Table (Clients/Customers)
CREATE TABLE IF NOT EXISTS parties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  balance REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL UNIQUE,
  party_id INTEGER NOT NULL,
  booking_id INTEGER,
  truck_id INTEGER,
  driver_id INTEGER,
  from_location TEXT,
  to_location TEXT,
  material TEXT,
  weight REAL,
  freight_amount REAL,
  advance_paid REAL DEFAULT 0,
  balance_amount REAL,
  status TEXT DEFAULT 'pending',
  invoice_date DATE,
  delivery_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (party_id) REFERENCES parties(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (truck_id) REFERENCES trucks(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER,
  booking_id INTEGER,
  truck_id INTEGER,
  expense_type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  expense_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (truck_id) REFERENCES trucks(id)
);

-- Tips Table  
CREATE TABLE IF NOT EXISTS tips (
  booking_id INTEGER,
  amount REAL NOT NULL,
  description TEXT,
  tip_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (booking_id) REFERENCES bookingTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Bookings Table (replaces old trips table with multi-vehicle support)
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_number TEXT NOT NULL UNIQUE,
  party_id INTEGER NOT NULL,
  truck_id INTEGER,
  driver_id INTEGER,
  vehicle_type_id INTEGER,
  from_location TEXT,
  to_location TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'booked',
  freight_amount REAL,
  advance_amount REAL DEFAULT 0,
  balance_amount REAL,
  billing_type TEXT DEFAULT 'fixed',
  material_description TEXT,
  weight_tons REAL,
  lr_number TEXT,
  start_odometer_reading REAL,
  end_odometer_reading REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (party_id) REFERENCES parties(id),
  FOREIGN KEY (truck_id) REFERENCES trucks(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Vendors Table (for vendor vehicles)
CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  is_active INTEGER DEFAULT 1,
  balance REAL DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table (main booking with auto-generated booking number)
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_number TEXT NOT NULL UNIQUE,
  party_id INTEGER NOT NULL,
  booking_date DATE NOT NULL,
  route_id INTEGER,
  from_location_id INTEGER,
  to_location_id INTEGER,
  from_location_text TEXT,
  to_location_text TEXT,
  total_amount REAL,
  material_description TEXT,
  weight_tons REAL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (party_id) REFERENCES parties(id),
  FOREIGN KEY (route_id) REFERENCES routes(id),
  FOREIGN KEY (from_location_id) REFERENCES locations(id),
  FOREIGN KEY (to_location_id) REFERENCES locations(id)
);

-- Booking Vehicles Table (multiple vehicles per booking)
CREATE TABLE IF NOT EXISTS booking_vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  vehicle_type_id INTEGER NOT NULL,
  vehicle_source TEXT NOT NULL CHECK(vehicle_source IN ('own', 'vendor')),
  truck_id INTEGER,
  vendor_id INTEGER,
  vehicle_number TEXT,
  driver_id INTEGER,
  driver_name TEXT,
  driver_phone TEXT,
  amount REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id),
  FOREIGN KEY (truck_id) REFERENCES trucks(id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trucks_driver ON trucks(driver_id);
CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party_id);
CREATE INDEX IF NOT EXISTS idx_invoices_booking ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_truck ON invoices(truck_id);
CREATE INDEX IF NOT EXISTS idx_expenses_invoice ON expenses(invoice_id);
CREATE INDEX IF NOT EXISTS idx_expenses_booking ON expenses(booking_id);
CREATE INDEX IF NOT EXISTS idx_tips_driver ON tips(driver_id);
CREATE INDEX IF NOT EXISTS idx_tips_booking ON tips(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_party ON bookings(party_id);
CREATE INDEX IF NOT EXISTS idx_bookings_truck ON bookings(truck_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_booking_vehicles_booking ON booking_vehicles(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_vehicles_truck ON booking_vehicles(truck_id);
CREATE INDEX IF NOT EXISTS idx_booking_vehicles_vendor ON booking_vehicles(vendor_id);
`;

export const supabaseSchema = `
-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trucks Table
CREATE TABLE IF NOT EXISTS trucks (
  id BIGSERIAL PRIMARY KEY,
  truck_number TEXT NOT NULL UNIQUE,
  truck_type TEXT,
  capacity DECIMAL,
  driver_id BIGINT REFERENCES drivers(id),
  status TEXT DEFAULT 'available',
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
  invoice_id BIGINT REFERENCES invoices(id),
  booking_id BIGINT REFERENCES bookings(id),
  truck_id BIGINT REFERENCES trucks(id),
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
  is_active INTEGER DEFAULT 1,
  balance DECIMAL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table (main booking with auto-generated booking number)
-- Replaces old trips table with multi-vehicle support
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  booking_number TEXT NOT NULL UNIQUE,
  party_id BIGINT NOT NULL REFERENCES parties(id),
  booking_date DATE NOT NULL,
  route_id BIGINT,
  from_location_id BIGINT,
  to_location_id BIGINT,
  from_location_text TEXT,
  to_location_text TEXT,
  total_amount DECIMAL,
  material_description TEXT,
  weight_tons DECIMAL,
  status TEXT DEFAULT 'pending',
  lr_number TEXT,
  invoice_number TEXT,
  pod_received INTEGER DEFAULT 0,
  pod_date DATE,
  loading_date DATE,
  unloading_date DATE,
  detention_hours DECIMAL,
  detention_charges DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Vehicles Table (multiple vehicles per booking)
CREATE TABLE IF NOT EXISTS booking_vehicles (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  vehicle_type_id BIGINT NOT NULL,
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trucks_driver ON trucks(driver_id);
CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party_id);
CREATE INDEX IF NOT EXISTS idx_invoices_truck ON invoices(truck_id);
CREATE INDEX IF NOT EXISTS idx_expenses_invoice ON expenses(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tips_driver ON tips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_party ON trips(party_id);
CREATE INDEX IF NOT EXISTS idx_trips_truck ON trips(truck_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_party ON bookings(party_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_booking_vehicles_booking ON booking_vehicles(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_vehicles_truck ON booking_vehicles(truck_id);
CREATE INDEX IF NOT EXISTS idx_booking_vehicles_vendor ON booking_vehicles(vendor_id);
`;
