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
  FOREIGN KEY (truck_id) REFERENCES trucks(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER,
  truck_id INTEGER,
  expense_type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  expense_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (truck_id) REFERENCES trucks(id)
);

-- Tips Table  
CREATE TABLE IF NOT EXISTS tips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  driver_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  tip_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_number TEXT NOT NULL UNIQUE,
  party_id INTEGER NOT NULL,
  truck_id INTEGER,
  driver_id INTEGER,
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trucks_driver ON trucks(driver_id);
CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party_id);
CREATE INDEX IF NOT EXISTS idx_invoices_truck ON invoices(truck_id);
CREATE INDEX IF NOT EXISTS idx_expenses_invoice ON expenses(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tips_driver ON tips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_party ON trips(party_id);
CREATE INDEX IF NOT EXISTS idx_trips_truck ON trips(truck_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
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
  amount DECIMAL NOT NULL,
  description TEXT,
  tip_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id BIGSERIAL PRIMARY KEY,
  trip_number TEXT NOT NULL UNIQUE,
  party_id BIGINT NOT NULL REFERENCES parties(id),
  truck_id BIGINT REFERENCES trucks(id),
  driver_id BIGINT REFERENCES drivers(id),
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trucks_driver ON trucks(driver_id);
CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party_id);
CREATE INDEX IF NOT EXISTS idx_invoices_truck ON invoices(truck_id);
CREATE INDEX IF NOT EXISTS idx_expenses_invoice ON expenses(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tips_driver ON tips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_party ON trips(party_id);
CREATE INDEX IF NOT EXISTS idx_trips_truck ON trips(truck_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
`;
