const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const schema = `
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trucks_driver ON trucks(driver_id);
CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party_id);
CREATE INDEX IF NOT EXISTS idx_invoices_truck ON invoices(truck_id);
CREATE INDEX IF NOT EXISTS idx_expenses_invoice ON expenses(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tips_driver ON tips(driver_id);
`;

function migrate() {
  console.log('Running SQLite migrations for local development...');
  
  const dbPath = path.join(process.cwd(), 'data', 'transport.db');
  const dbDir = path.dirname(dbPath);
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  
  try {
    // Split and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    statements.forEach(statement => {
      db.exec(statement);
    });
    
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

migrate();
