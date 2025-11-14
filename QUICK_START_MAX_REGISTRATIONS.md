# Quick Start: Maximum Registrations Per Slot

## Installation (2 minutes)

### Step 1: Run SQL Migration
Open Supabase SQL Editor and run:

```sql
-- If you already have the settings table:
INSERT INTO settings (key, value) 
VALUES ('max_registrations_per_slot', '15')
ON CONFLICT (key) DO NOTHING;
```

### Step 2: Done!
The feature is now active. No code deployment needed.

## Usage

1. Login as super admin at `/admin`
2. Click "Settings" tab
3. Change "Maximum Registrations Per Slot" (1-100)
4. Click "Save Settings"
5. Changes take effect immediately

## What Happens

- **Registration Form**: Shows only slots below the limit
- **Admin Dashboard**: Displays "X/MAX" capacity for each slot
- **Real-time**: All users see updates instantly
- **Existing Data**: Not affected, remains valid

## Example Scenarios

### Increase Capacity (15 → 25)
- Slots with 16-24 registrations become available again
- More students can register

### Decrease Capacity (15 → 10)
- Slots with 11+ registrations marked as full
- No new registrations accepted for those slots
- Existing 11+ registrations remain valid

## Validation

- Minimum: 1
- Maximum: 100
- Default: 15 (if setting not found)

## Files Changed

- `src/components/Settings.jsx` - Added input field
- `src/hooks/useSlotAvailability.js` - Uses dynamic value
- `src/components/AdminDashboard.jsx` - Shows dynamic capacity
- `create-settings-table.sql` - Added default setting

## Troubleshooting

**Setting not visible?**
- Ensure you're logged in as super admin (not slot admin)

**Changes not reflecting?**
- Check browser console for errors
- Verify setting saved in Supabase dashboard

**Need help?**
- See `MAX_REGISTRATIONS_FEATURE.md` for detailed documentation
