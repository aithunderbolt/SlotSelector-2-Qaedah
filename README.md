# Registration Form App

A responsive registration form built with React and Vite, using Supabase as the backend.

## Features

- Registration form with Name, Email, WhatsApp Mobile, and Time Slot selection
- Configurable time slots with individual maximum registrations per slot
- Real-time slot availability updates
- Fully responsive design
- Slots automatically hidden when full
- Admin dashboard with role-based access control
- User management for slot admins
- Slot management with editable names and capacities
- Settings management for form customization
- Excel export functionality

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Supabase:**
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key to `.env`

3. **Create Supabase tables:**
   Run this SQL in your Supabase SQL Editor:
   ```sql
   -- Slots table (master data for time slots)
   CREATE TABLE slots (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     display_name TEXT NOT NULL UNIQUE,
     slot_order INTEGER NOT NULL UNIQUE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   ); 

   -- Insert default slots (you can change display_name anytime)
   INSERT INTO slots (display_name, slot_order) VALUES
   ('Slot 1', 1),
   ('Slot 2', 2),
   ('Slot 3', 3),
   ('Slot 4', 4),
   ('Slot 5', 5),
   ('Slot 6', 6),
   ('Slot 7', 7),
   ('Slot 8', 8),
   ('Slot 9', 9),
   ('Slot 10', 10);

   -- Registrations table
   CREATE TABLE registrations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     whatsapp_mobile TEXT NOT NULL UNIQUE,
     slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE RESTRICT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE INDEX idx_slot_id ON registrations(slot_id);
   CREATE UNIQUE INDEX idx_unique_whatsapp ON registrations(whatsapp_mobile);

   -- Users table for admin authentication
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     username TEXT NOT NULL UNIQUE,
     password TEXT NOT NULL,
     role TEXT NOT NULL CHECK (role IN ('super_admin', 'slot_admin')),
     assigned_slot_id UUID REFERENCES slots(id) ON DELETE SET NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE UNIQUE INDEX idx_unique_username ON users(username);

   -- Insert sample admin users (get slot IDs first)
   INSERT INTO users (username, password, role, assigned_slot_id) 
   SELECT 'superadmin', 'admin123', 'super_admin', NULL
   UNION ALL
   SELECT 'slot1admin', 'slot1pass', 'slot_admin', id FROM slots WHERE slot_order = 1
   UNION ALL
   SELECT 'slot2admin', 'slot2pass', 'slot_admin', id FROM slots WHERE slot_order = 2
   UNION ALL
   SELECT 'slot3admin', 'slot3pass', 'slot_admin', id FROM slots WHERE slot_order = 3
   UNION ALL
   SELECT 'slot4admin', 'slot4pass', 'slot_admin', id FROM slots WHERE slot_order = 4
   UNION ALL
   SELECT 'slot5admin', 'slot5pass', 'slot_admin', id FROM slots WHERE slot_order = 5
   UNION ALL
   SELECT 'slot6admin', 'slot6pass', 'slot_admin', id FROM slots WHERE slot_order = 6
   UNION ALL
   SELECT 'slot7admin', 'slot7pass', 'slot_admin', id FROM slots WHERE slot_order = 7
   UNION ALL
   SELECT 'slot8admin', 'slot8pass', 'slot_admin', id FROM slots WHERE slot_order = 8
   UNION ALL
   SELECT 'slot9admin', 'slot9pass', 'slot_admin', id FROM slots WHERE slot_order = 9
   UNION ALL
   SELECT 'slot10admin', 'slot10pass', 'slot_admin', id FROM slots WHERE slot_order = 10;
   ```

4. **Enable Row Level Security (RLS):**
   ```sql
   -- Slots table policies
   ALTER TABLE slots ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Enable read for all users" ON slots
     FOR SELECT USING (true);

   CREATE POLICY "Enable update for all users" ON slots
     FOR UPDATE USING (true);

   -- Registrations table policies
   ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Enable insert for all users" ON registrations
     FOR INSERT WITH CHECK (true);

   CREATE POLICY "Enable read for all users" ON registrations
     FOR SELECT USING (true);

   -- Users table policies
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Enable read for all users" ON users
     FOR SELECT USING (true);

   CREATE POLICY "Enable insert for all users" ON users
     FOR INSERT WITH CHECK (true);

   CREATE POLICY "Enable update for all users" ON users
     FOR UPDATE USING (true);

   CREATE POLICY "Enable delete for all users" ON users
     FOR DELETE USING (true);
   ```

5. **Optional - Add slot limit constraint:**
   Create a function to enforce the 2-person limit per slot:
   ```sql
   CREATE OR REPLACE FUNCTION check_slot_capacity()
   RETURNS TRIGGER AS $$
   BEGIN
     IF (SELECT COUNT(*) FROM registrations WHERE slot_id = NEW.slot_id) >= 2 THEN
       RAISE EXCEPTION 'This slot is full';
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER enforce_slot_capacity
     BEFORE INSERT ON registrations
     FOR EACH ROW
     EXECUTE FUNCTION check_slot_capacity();
   ```

6. **To change slot display names:**
   Simply update the slots table:
   ```sql
   -- Example: Change "Slot 1" to "Slot A"
   UPDATE slots SET display_name = 'Slot A' WHERE slot_order = 1;
   UPDATE slots SET display_name = 'Slot B' WHERE slot_order = 2;
   -- etc...
   ```
   The changes will reflect immediately across the entire application!

## Development

```bash
npm run dev
```

## Production

1. Update `.env` with production Supabase credentials
2. Build the app:
   ```bash
   npm run build
   ```
3. Deploy the `dist` folder to your hosting service

## Environment Variables

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Admin Dashboard

Access the admin dashboard at `/admin` route. Two types of admin access:

**Super Admin:**
- Username: `superadmin` / Password: `admin123`
- Can view all registrations across all slots
- Can filter and download data for any slot or all slots
- See statistics for all slots
- **Can manage slot admin users** (create, edit, delete)
- Can change slot admin usernames and passwords
- **Can manage slot names** (edit display names)

**Slot Admins:**
- Username: `slot1admin` to `slot10admin` / Password: `slot1pass` to `slot10pass`
- Can only view registrations for their assigned slot
- Can download data for their slot only
- See statistics for their slot only

Features:
- Live registration data with real-time updates
- Role-based access control
- Excel export functionality
- User management for super admins
- Slot management for super admins
- Responsive design

## User Management (Super Admin Only)

Super admins can manage slot admin users through the "User Management" tab in the admin dashboard:

- **Add new slot admins:** Create new slot admin accounts with username, password, and assigned slot
- **Edit existing admins:** Update username, password, or reassign to different slots
- **Delete admins:** Remove slot admin accounts from the system
- **View all slot admins:** See a list of all slot admin users and their assigned slots

To access user management:
1. Login as super admin
2. Navigate to the "User Management" tab in the dashboard
3. Use the "Add Slot Admin" button to create new users
4. Click "Edit" or "Delete" on existing users to manage them

## Slot Management (Super Admin Only)

Super admins can manage slot display names through the "Slot Management" tab:

- **Edit slot names:** Change the display name of any slot (e.g., "Slot 1" to "Morning Session")
- **Real-time updates:** Changes reflect immediately across the entire application
- **Inline editing:** Click "Edit Name" to modify a slot name directly in the table

To access slot management:
1. Login as super admin
2. Navigate to the "Slot Management" tab in the dashboard
3. Click "Edit Name" on any slot to change its display name
4. Click "Save" to apply changes or "Cancel" to discard

## Settings Management (Super Admin Only)

Super admins can manage application settings through the "Settings" tab:

- **Registration Form Title:** Change the title displayed at the top of the registration form
- **Real-time updates:** Changes reflect immediately on the registration form for all users
- **Easy customization:** Personalize the form title to match your event or organization

To access settings:
1. Login as super admin
2. Navigate to the "Settings" tab in the dashboard
3. Update the "Registration Form Title" field
4. Click "Save Settings" to apply changes

**Setup Instructions:**
Run the `create-settings-table.sql` file in your Supabase SQL Editor to create the settings table and enable this feature.

## Per-Slot Maximum Registrations (Super Admin Only)

Super admins can set individual maximum registration limits for each time slot:

- **Individual Limits:** Each slot can have its own capacity (e.g., Slot A: 20, Slot B: 10, Slot C: 15)
- **Flexible Capacity:** Different slots can accommodate different numbers of students
- **Real-time Updates:** Changes take effect immediately across the entire system
- **Easy Management:** Edit max registrations directly in the Slot Management tab

To set per-slot maximum registrations:
1. Login as super admin
2. Navigate to the "Slot Management" tab
3. Click "Edit" on any slot
4. Change the "Maximum Registrations" field (1-100)
5. Click "Save"

**Setup Instructions:**
Run the `add-max-registrations-to-slots.sql` file in your Supabase SQL Editor to add this feature.

**Documentation:**
- Quick Start: See `QUICK_START_PER_SLOT_MAX.md`
- Full Documentation: See `PER_SLOT_MAX_REGISTRATIONS.md`
- Migration Guide: See `MIGRATION_TO_PER_SLOT_MAX.md`
