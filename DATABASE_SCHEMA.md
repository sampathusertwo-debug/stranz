# Transport Book Database Schema

## Overview
The Transport Book application uses a comprehensive relational database schema designed for managing a transport/logistics business. The database supports both local development (using lowdb/JSON) and production (using Supabase/PostgreSQL).

## Database Configuration
- **Local Development**: JSON-based database using `lowdb` stored at `data/transport.json`
- **Production**: Supabase (PostgreSQL)
- **Environment Variable**: `USE_SUPABASE=false` for local, `USE_SUPABASE=true` for production

## Database Tables

### Reference Tables
These tables store master data and are pre-populated with default values.

#### 1. vehicle_types
Stores truck/vehicle type definitions with images and capacity information.
- `id` (Primary Key)
- `name` - Vehicle type name (LCV, Open Truck, Closed Truck, Trailer, Tanker, Tipper, Bus)
- `code` - Unique code for the vehicle type
- `description` - Description of the vehicle type
- `typical_capacity_tons` - Typical capacity in tons
- `image_url` - Path to vehicle type image
- `created_at` - Timestamp

#### 2. expense_categories
Stores expense category reference data.
- `id` (Primary Key)
- `name` - Category name (Fuel, Toll, Maintenance, etc.)
- `code` - Unique category code
- `description` - Category description
- `is_active` - Active status (1/0)
- `created_at` - Timestamp

#### 3. status_types
Generic status reference table for trips, invoices, and trucks.
- `id` (Primary Key)
- `category` - Status category (trip, invoice, truck)
- `name` - Status name
- `code` - Unique status code
- `description` - Status description
- `display_order` - Display order for UI
- `created_at` - Timestamp

#### 4. locations
Cities and places for route management.
- `id` (Primary Key)
- `name` - Location name
- `city` - City name
- `state` - State name
- `country` - Country (default: India)
- `pincode` - Postal code
- `latitude` - GPS latitude
- `longitude` - GPS longitude
- `is_active` - Active status
- `created_at` - Timestamp

#### 5. routes
Common routes with distance and freight information.
- `id` (Primary Key)
- `from_location_id` - Foreign Key to locations
- `to_location_id` - Foreign Key to locations
- `distance_km` - Distance in kilometers
- `estimated_hours` - Estimated travel time
- `toll_charges` - Expected toll charges
- `typical_freight` - Typical freight amount
- `is_active` - Active status
- `created_at` - Timestamp

### Core Business Entity Tables

#### 6. drivers
Driver information and details.
- `id` (Primary Key)
- `name` - Driver name (required)
- `phone` - Primary phone number
- `alternate_phone` - Secondary phone
- `email` - Email address
- `license_number` - Driving license number  
- `license_expiry_date` - License expiry date
- `address` - Full address
- `city` - City
- `state` - State
- `pincode` - Postal code
- `aadhar_number` - Aadhar card number
- `pan_number` - PAN card number
- `bank_account_number` - Bank account
- `bank_ifsc` - Bank IFSC code
- `bank_name` - Bank name
- `status` - Current status (active/inactive)
- `balance` - Current balance amount
- `joining_date` - Date joined
- `notes` - Additional notes
- `created_at` - Created timestamp
- `updated_at` - Last updated timestamp

#### 7. trucks
Vehicle/truck information.
- `id` (Primary Key)
- `truck_number` - Registration number (required, unique)
- `vehicle_type_id` - Foreign Key to vehicle_types
- `ownership_type` - MY (owned) or MARKET (not owned)
- `capacity_tons` - Actual capacity in tons
- `driver_id` - Foreign Key to drivers (assigned driver)
- `status` - Current status (available, on_trip, maintenance, inactive)
- `rc_number` - RC book number
- `insurance_expiry_date` - Insurance expiry
- `fitness_expiry_date` - Fitness certificate expiry
- `permit_expiry_date` - Permit expiry
- `purchase_date` - Purchase date
- `model` - Vehicle model
- `manufacturer` - Vehicle manufacturer
- `year` - Manufacturing year
- `notes` - Additional notes
- `created_at` - Created timestamp
- `updated_at` - Last updated timestamp

#### 8. parties
Customer/supplier information.
- `id` (Primary Key)
- `name` - Party name (required)
- `party_type` - customer or supplier
- `phone` - Primary phone
- `alternate_phone` - Secondary phone
- `email` - Email address
- `address` - Full address
- `city` - City
- `state` - State
- `pincode` - Postal code
- `gst_number` - GST number
- `pan_number` - PAN number
- `contact_person` - Contact person name
- `credit_limit` - Credit limit amount
- `credit_days` - Credit period in days
- `balance` - Current balance
- `is_active` - Active status
- `notes` - Additional notes
- `created_at` - Created timestamp
- `updated_at` - Last updated timestamp

#### 9. trips
Main business entity for transport bookings/trips.
- `id` (Primary Key)
- `trip_number` - Unique trip number (required)
- `party_id` - Foreign Key to parties (required)
- `truck_id` - Foreign Key to trucks
- `driver_id` - Foreign Key to drivers
- `route_id` - Foreign Key to routes
- `from_location_id` - Foreign Key to locations
- `to_location_id` - Foreign Key to locations
- `start_date` - Trip start date
- `end_date` - Trip end date
- `status` - Trip status (booked, in_transit, delivered, cancelled)
- `freight_amount` - Total freight amount
- `advance_amount` - Advance paid
- `balance_amount` - Balance remaining
- `material_description` - Description of material/goods
- `weight_tons` - Weight in tons
- `lr_number` - LR (Lorry Receipt) number
- `invoice_number` - Invoice number
- `pod_received` - POD (Proof of Delivery) received status
- `pod_date` - POD received date
- `loading_date` - Loading date
- `unloading_date` - Unloading date
- `detention_hours` - Detention time in hours
- `detention_charges` - Detention charges amount
- `notes` - Additional notes
- `created_at` - Created timestamp
- `updated_at` - Last updated timestamp

#### 10. invoices
Invoice/billing information.
- `id` (Primary Key)
- `invoice_number` - Unique invoice number (required)
- `party_id` - Foreign Key to parties (required)
- `trip_id` - Foreign Key to trips
- `invoice_date` - Invoice date
- `amount` - Invoice amount (before tax)
- `tax_amount` - Tax amount
- `total_amount` - Total amount (including tax)
- `paid_amount` - Amount paid
- `balance_amount` - Balance remaining
- `status` - Payment status (pending, partial, paid, overdue)
- `due_date` - Payment due date
- `payment_terms` - Payment terms
- `notes` - Additional notes
- `created_at` - Created timestamp
- `updated_at` - Last updated timestamp

#### 11. payments
Payment tracking for all transactions.
- `id` (Primary Key)
- `payment_type` - Type of payment (income/expense)
- `reference_type` - Reference entity type (invoice/trip/driver)
- `reference_id` - ID of referenced entity
- `party_id` - Foreign Key to parties
- `driver_id` - Foreign Key to drivers
- `amount` - Payment amount (required)
- `payment_date` - Payment date (required)
- `payment_mode` - cash, cheque, bank_transfer, upi, etc.
- `transaction_reference` - Transaction reference number
- `bank_name` - Bank name
- `cheque_number` - Cheque number
- `cheque_date` - Cheque date
- `upi_id` - UPI ID
- `notes` - Additional notes
- `created_at` - Created timestamp

#### 12. expenses
Expense tracking with category and linkage to trips/trucks/drivers.
- `id` (Primary Key)
- `expense_category_id` - Foreign Key to expense_categories
- `trip_id` - Foreign Key to trips (trip-specific expenses)
- `truck_id` - Foreign Key to trucks (truck-specific expenses)
- `driver_id` - Foreign Key to drivers (driver-specific expenses)
- `description` - Expense description (required)
- `amount` - Expense amount (required)
- `expense_date` - Expense date (required)
- `payment_mode` - Payment method
- `receipt_number` - Receipt/bill number
- `receipt_url` - Path to receipt image/PDF
- `is_billable` - Can be billed to customer (1/0)
- `is_reimbursed` - Already reimbursed (1/0)
- `notes` - Additional notes
- `created_at` - Created timestamp
- `updated_at` - Last updated timestamp

#### 13. tips
Driver tips/incentives tracking.
- `id` (Primary Key)
- `driver_id` - Foreign Key to drivers (required)
- `trip_id` - Foreign Key to trips
- `amount` - Tip amount (required)
- `tip_date` - Tip date (required)
- `payment_mode` - Payment method
- `notes` - Additional notes
- `created_at` - Created timestamp

## Relationships

### Foreign Key Relationships
- trucks.driver_id → drivers.id
- trucks.vehicle_type_id → vehicle_types.id
- routes.from_location_id → locations.id
- routes.to_location_id → locations.id
- trips.party_id → parties.id
- trips.truck_id → trucks.id
- trips.driver_id → drivers.id
- trips.route_id → routes.id
- trips.from_location_id → locations.id
- trips.to_location_id → locations.id
- invoices.party_id → parties.id
- invoices.trip_id → trips.id
- payments.party_id → parties.id
- payments.driver_id → drivers.id
- expenses.expense_category_id → expense_categories.id
- expenses.trip_id → trips.id
- expenses.truck_id → trucks.id
- expenses.driver_id → drivers.id
- tips.driver_id → drivers.id
- tips.trip_id → trips.id

## Database Operations

The application provides a unified interface for database operations:

```typescript
import { db } from '@/lib/db';

// Check which database is in use
db.isUsingSupabase(); // returns boolean

// CRUD operations (works with both local and Supabase)
await db.sqlite.getAll('drivers'); // Get all records
await db.sqlite.getById('drivers', 1); // Get by ID
await db.sqlite.insert('drivers', { name: 'John', phone: '1234567890' });
await db.sqlite.update('drivers', 1, { phone: '9876543210' });
await db.sqlite.delete('drivers', 1);

// Supabase client (production)
const supabase = db.supabase();
```

## Pre-populated Reference Data

### Vehicle Types (7 types)
1. LCV (Light Commercial Vehicle) - 1.5 tons
2. Open Truck - 5 tons
3. Closed Truck - 7 tons
4. Trailer - 20 tons
5. Tanker - 15 tons
6. Tipper - 10 tons
7. Bus - Passenger vehicle

### Expense Categories (14 categories)
Fuel, Toll, Maintenance, Driver Salary, Loading Charges, Parking, Insurance, RTO Fees, Office Rent, Staff Salary, Electricity, Internet, Stationery, Miscellaneous

### Status Types (12 statuses)
**Trip Statuses**: Booked, In Transit, Delivered, Cancelled
**Invoice Statuses**: Pending, Partial, Paid, Overdue
**Truck Statuses**: Available, On Trip, Maintenance, Inactive

## Notes

- All monetary amounts are stored as REAL/decimal numbers
- All dates are stored as TEXT in ISO 8601 format (YYYY-MM-DD or ISO string)
- Boolean values are stored as INTEGER (1 for true, 0 for false)
- The local JSON database auto-generates IDs sequentially
- Foreign key constraints ensure data integrity
- Timestamps are automatically managed for created_at and updated_at fields
