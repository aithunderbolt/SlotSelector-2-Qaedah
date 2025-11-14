# Maximum Registrations Per Slot Feature

## Overview
This feature allows super admins to dynamically configure the maximum number of registrations allowed per time slot. The setting is managed from the admin dashboard and takes effect immediately across the entire system.

## Key Features

✅ **Super Admin Only**: Only super admins can modify the maximum registrations setting
✅ **Real-time Updates**: Changes take effect immediately without requiring page refresh
✅ **System-wide Effect**: Affects all components that check slot availability
✅ **Validation**: Enforces limits between 1-100 registrations per slot
✅ **Fallback**: Defaults to 15 if setting is not found
✅ **No Breaking Changes**: Existing functionality remains intact

## Installation

### Step 1: Run SQL Migration

If you already have the settings table, run this migration in your Supabase SQL Editor:

```sql
-- File: add-max-registrations-setting.sql
INSERT INTO settings (key, value) 
VALUES ('max_registrations_per_slot', '15')
ON CONFLICT (key) DO NOTHING;
```

If you're setting up from scratch, the `create-settings-table.sql` file already includes this setting.

### Step 2: Verify Installation

1. Login as super admin
2. Navigate to the Settings tab
3. You should see the "Maximum Registrations Per Slot" field

## How It Works

### 1. Settings Component (`src/components/Settings.jsx`)
- Fetches current max registrations value from database
- Provides input field for super admin to modify the value
- Validates input (1-100 range)
- Saves changes to database

### 2. Slot Availability Hook (`src/hooks/useSlotAvailability.js`)
- Fetches max registrations setting on load
- Subscribes to real-time changes
- Filters available slots based on current registrations vs max limit
- Returns `maxRegistrations` value for use in other components

### 3. Admin Dashboard (`src/components/AdminDashboard.jsx`)
- Fetches max registrations setting
- Displays slot capacity as "X/MAX" format
- Marks slots as "full" when they reach the limit
- Updates in real-time when setting changes

### 4. Registration Form (`src/components/RegistrationForm.jsx`)
- Uses `useSlotAvailability` hook
- Only shows slots that haven't reached the maximum
- Displays "All slots are full" message when no slots available

## Usage

### Changing Maximum Registrations

1. Login as super admin at `/admin`
2. Click on the "Settings" tab
3. Find "Maximum Registrations Per Slot" field
4. Enter a value between 1 and 100
5. Click "Save Settings"
6. Changes take effect immediately

### What Happens When You Change the Limit

**Increasing the limit (e.g., 15 → 20):**
- Previously full slots become available again
- Registration form shows more slots
- Admin dashboard updates capacity display

**Decreasing the limit (e.g., 15 → 10):**
- Slots that exceed new limit are marked as full
- Registration form hides those slots
- Existing registrations remain valid (no data loss)
- Admin dashboard shows slots as full

## Database Constraints

### Application-Level Validation
The system uses application-level validation rather than database constraints. This provides:

- **Flexibility**: Change limits without database migrations
- **Real-time updates**: Instant effect across all users
- **No data migration**: Existing registrations remain valid
- **Graceful degradation**: System works even if setting is missing

### Optional Database Constraint
If you want to enforce a hard database constraint, you can add a trigger in Supabase:

```sql
-- Optional: Add database-level constraint
CREATE OR REPLACE FUNCTION check_slot_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get current count for the slot
  SELECT COUNT(*) INTO current_count
  FROM registrations
  WHERE slot_id = NEW.slot_id;
  
  -- Get max allowed from settings
  SELECT value::INTEGER INTO max_allowed
  FROM settings
  WHERE key = 'max_registrations_per_slot';
  
  -- Default to 15 if not found
  IF max_allowed IS NULL THEN
    max_allowed := 15;
  END IF;
  
  -- Check if slot is full
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Slot is full. Maximum % registrations allowed.', max_allowed;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_slot_capacity
  BEFORE INSERT ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_slot_capacity();
```

**Note**: This is optional and not required for the feature to work.

## Real-time Subscriptions

The system subscribes to changes in the settings table:

```javascript
// In useSlotAvailability.js
const settingsChannel = supabase
  .channel('settings-max-reg-changes')
  .on(
    'postgres_changes',
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'settings', 
      filter: 'key=eq.max_registrations_per_slot' 
    },
    () => {
      fetchSlotCounts(); // Refresh data
    }
  )
  .subscribe();
```

This ensures all users see updates immediately without refreshing the page.

## Error Handling

### Validation Errors
- Empty value: "Maximum registrations must be a positive number"
- Value < 1: "Maximum registrations must be a positive number"
- Value > 100: "Maximum registrations cannot exceed 100"
- Non-numeric: "Maximum registrations must be a positive number"

### Fallback Behavior
If the setting is not found in the database:
- System defaults to 15 registrations per slot
- No errors are thrown
- System continues to function normally

## Testing

### Test Scenarios

1. **Change limit from 15 to 20**
   - Verify slots show "X/20" in admin dashboard
   - Verify previously full slots become available

2. **Change limit from 15 to 5**
   - Verify slots with >5 registrations show as full
   - Verify registration form hides full slots
   - Verify existing registrations are not affected

3. **Invalid inputs**
   - Try entering 0, -1, 101, "abc"
   - Verify appropriate error messages

4. **Real-time updates**
   - Open admin dashboard in two browser windows
   - Change setting in one window
   - Verify other window updates automatically

5. **Slot admin view**
   - Login as slot admin
   - Verify they cannot access Settings tab
   - Verify they see updated capacity in their dashboard

## Troubleshooting

### Setting not saving
- Check browser console for errors
- Verify super admin permissions
- Check Supabase RLS policies on settings table

### Changes not reflecting
- Check real-time subscription is active
- Verify setting value in Supabase dashboard
- Clear browser cache and reload

### Slots not showing as full
- Verify max registrations value is correct
- Check registration counts in database
- Verify `useSlotAvailability` hook is fetching latest value

## Files Modified

- `src/components/Settings.jsx` - Added max registrations input
- `src/hooks/useSlotAvailability.js` - Fetch and use dynamic max value
- `src/components/AdminDashboard.jsx` - Display dynamic capacity
- `create-settings-table.sql` - Added default setting
- `SETTINGS_FEATURE.md` - Updated documentation

## Files Created

- `add-max-registrations-setting.sql` - Migration for existing installations
- `MAX_REGISTRATIONS_FEATURE.md` - This documentation file
