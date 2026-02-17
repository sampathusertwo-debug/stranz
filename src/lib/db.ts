import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const isProduction = process.env.NODE_ENV === 'production';
// If USE_SUPABASE is explicitly set, use that value; otherwise default to production mode
const useSupabase = process.env.USE_SUPABASE !== undefined 
  ? process.env.USE_SUPABASE === 'true' 
  : isProduction;

// Define database schema
type DatabaseSchema = {
  vehicle_types: any[];
  expense_categories: any[];
  status_types: any[];
  locations: any[];
  routes: any[];
  drivers: any[];
  trucks: any[];
  parties: any[];
  trips: any[];
  quotes: any[];
  invoices: any[];
  payments: any[];
  expenses: any[];
  tips: any[];
};

let localDb: any = null;
let isInitialized = false;

// Initialize lowdb database for local development
async function getLocalDB() {
  if (!localDb) {
    const dbPath = path.join(process.cwd(), 'data', 'transport.json');
    
    // Initialize database with empty tables
    const defaultData: DatabaseSchema = {
      vehicle_types: [],
      expense_categories: [],
      status_types: [],
      locations: [],
      routes: [],
      drivers: [],
      trucks: [],
      parties: [],
      trips: [],
      quotes: [],
      invoices: [],
      payments: [],
      expenses: [],
      tips: [],
    };

    localDb = await JSONFilePreset<DatabaseSchema>(dbPath, defaultData);
    
    // Initialize reference data only once
    if (!isInitialized && localDb.data.vehicle_types.length === 0) {
      isInitialized = true;
      await insertDefaultReferenceData();
    }
  }
  
  return localDb;
}

async function insertDefaultReferenceData() {
  if (!localDb) {
    throw new Error('Database not initialized');
  }
  const database = localDb;
  
  // Insert vehicle types
  const vehicleTypes = [
    { id: 1, name: 'LCV', code: 'lcv', description: 'Light Commercial Vehicle', typical_capacity_tons: 1.5, image_url: '/images/trucks/lcv.png', created_at: new Date().toISOString() },
    { id: 2, name: 'Open Truck', code: 'open', description: 'Open body truck', typical_capacity_tons: 5, image_url: '/images/trucks/open_truck.png', created_at: new Date().toISOString() },
    { id: 3, name: 'Closed Truck', code: 'closed', description: 'Closed/Container truck', typical_capacity_tons: 7, image_url: '/images/trucks/closed_truck.png', created_at: new Date().toISOString() },
    { id: 4, name: 'Trailer', code: 'trailer', description: 'Trailer truck', typical_capacity_tons: 20, image_url: '/images/trucks/trailer.png', created_at: new Date().toISOString() },
    { id: 5, name: 'Tanker', code: 'tanker', description: 'Tanker for liquids', typical_capacity_tons: 15, image_url: '/images/trucks/tanker.png', created_at: new Date().toISOString() },
    { id: 6, name: 'Tipper', code: 'tipper', description: 'Tipper/Dumper truck', typical_capacity_tons: 10, image_url: '/images/trucks/tipper.png', created_at: new Date().toISOString() },
    { id: 7, name: 'Bus', code: 'bus', description: 'Passenger bus', typical_capacity_tons: 0, image_url: '/images/trucks/bus.png', created_at: new Date().toISOString() },
  ];
  
  database.data.vehicle_types = vehicleTypes;
  
  // Insert expense categories
  const expenseCategories = [
    { id: 1, name: 'Fuel', code: 'fuel', description: 'Fuel expenses (Diesel/Petrol)', is_active: 1, created_at: new Date().toISOString() },
    { id: 2, name: 'Toll', code: 'toll', description: 'Toll charges', is_active: 1, created_at: new Date().toISOString() },
    { id: 3, name: 'Maintenance', code: 'maintenance', description: 'Vehicle maintenance and repairs', is_active: 1, created_at: new Date().toISOString() },
    { id: 4, name: 'Driver Salary', code: 'driver_salary', description: 'Driver salary payments', is_active: 1, created_at: new Date().toISOString() },
    { id: 5, name: 'Loading Charges', code: 'loading', description: 'Loading and unloading charges', is_active: 1, created_at: new Date().toISOString() },
    { id: 6, name: 'Parking', code: 'parking', description: 'Parking charges', is_active: 1, created_at: new Date().toISOString() },
    { id: 7, name: 'Insurance', code: 'insurance', description: 'Vehicle insurance', is_active: 1, created_at: new Date().toISOString() },
    { id: 8, name: 'RTO Fees', code: 'rto', description: 'RTO and permit fees', is_active: 1, created_at: new Date().toISOString() },
    { id: 9, name: 'Office Rent', code: 'rent', description: 'Office rent', is_active: 1, created_at: new Date().toISOString() },
    { id: 10, name: 'Staff Salary', code: 'salary', description: 'Office staff salary', is_active: 1, created_at: new Date().toISOString() },
    { id: 11, name: 'Electricity', code: 'electricity', description: 'Electricity bill', is_active: 1, created_at: new Date().toISOString() },
    { id: 12, name: 'Internet', code: 'internet', description: 'Internet and phone bill', is_active: 1, created_at: new Date().toISOString() },
    { id: 13, name: 'Stationery', code: 'stationery', description: 'Office stationery', is_active: 1, created_at: new Date().toISOString() },
    { id: 14, name: 'Miscellaneous', code: 'misc', description: 'Other miscellaneous expenses', is_active: 1, created_at: new Date().toISOString() },
  ];
  
  database.data.expense_categories = expenseCategories;
  
  // Insert status types
  const statusTypes = [
    { id: 1, category: 'trip', name: 'Booked', code: 'booked', description: 'Trip booked', display_order: 1, created_at: new Date().toISOString() },
    { id: 2, category: 'trip', name: 'In Transit', code: 'in_transit', description: 'Trip in progress', display_order: 2, created_at: new Date().toISOString() },
    { id: 3, category: 'trip', name: 'Delivered', code: 'delivered', description: 'Trip completed', display_order: 3, created_at: new Date().toISOString() },
    { id: 4, category: 'trip', name: 'Cancelled', code: 'cancelled', description: 'Trip cancelled', display_order: 4, created_at: new Date().toISOString() },
    { id: 5, category: 'invoice', name: 'Pending', code: 'pending', description: 'Payment pending', display_order: 1, created_at: new Date().toISOString() },
    { id: 6, category: 'invoice', name: 'Partial', code: 'partial', description: 'Partially paid', display_order: 2, created_at: new Date().toISOString() },
    { id: 7, category: 'invoice', name: 'Paid', code: 'paid', description: 'Fully paid', display_order: 3, created_at: new Date().toISOString() },
    { id: 8, category: 'invoice', name: 'Overdue', code: 'overdue', description: 'Payment overdue', display_order: 4, created_at: new Date().toISOString() },
    { id: 9, category: 'truck', name: 'Available', code: 'available', description: 'Truck available', display_order: 1, created_at: new Date().toISOString() },
    { id: 10, category: 'truck', name: 'On Trip', code: 'on_trip', description: 'Truck on trip', display_order: 2, created_at: new Date().toISOString() },
    { id: 11, category: 'truck', name: 'Maintenance', code: 'maintenance', description: 'Under maintenance', display_order: 3, created_at: new Date().toISOString() },
    { id: 12, category: 'truck', name: 'Inactive', code: 'inactive', description: 'Not in service', display_order: 4, created_at: new Date().toISOString() },
  ];
  
  database.data.status_types = statusTypes;
  
  await database.write();
}

// Get Supabase client for production
function getSupabaseClient() {
  if (!useSupabase) {
    throw new Error('Supabase is not enabled. Set USE_SUPABASE=true in .env.local to use Supabase.');
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_') || supabaseKey.includes('your_')) {
    throw new Error('Supabase credentials not configured properly. Please update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Helper function to get next ID for a table
function getNextId(table: any[]): number {
  if (table.length === 0) return 1;
  const maxId = Math.max(...table.map(item => item.id || 0));
  return maxId + 1;
}

// Unified database interface
export const db = {
  // Check which database to use
  isUsingSupabase: () => useSupabase,
  
  // Local database operations (lowdb)
  sqlite: {
    getAll: async (table: string) => {
      const database = await getLocalDB();
      return database.data[table as keyof DatabaseSchema] || [];
    },
    
    getById: async (table: string, id: number) => {
      const database = await getLocalDB();
      const tableData = database.data[table as keyof DatabaseSchema] as any[];
      return tableData.find(item => item.id === id) || null;
    },
    
    insert: async (table: string, data: any) => {
      const database = await getLocalDB();
      const tableData = database.data[table as keyof DatabaseSchema] as any[];
      
      const newId = getNextId(tableData);
      const newItem = {
        ...data,
        id: newId,
        created_at: new Date().toISOString(),
      };
      
      tableData.push(newItem);
      await database.write();
      
      return newItem;
    },
    
    update: async (table: string, id: number, data: any) => {
      const database = await getLocalDB();
      const tableData = database.data[table as keyof DatabaseSchema] as any[];
      
      const index = tableData.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error(`Item with id ${id} not found in table ${table}`);
      }
      
      tableData[index] = {
        ...tableData[index],
        ...data,
        id, // Preserve the ID
        updated_at: new Date().toISOString(),
      };
      
      await database.write();
      return tableData[index];
    },
    
    delete: async (table: string, id: number) => {
      const database = await getLocalDB();
      const tableData = database.data[table as keyof DatabaseSchema] as any[];
      
      const index = tableData.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error(`Item with id ${id} not found in table ${table}`);
      }
      
      tableData.splice(index, 1);
      await database.write();
      
      return { success: true };
    },
  },
  
  // Supabase client for production
  supabase: getSupabaseClient,
};

export { isProduction, useSupabase };
export default db;
