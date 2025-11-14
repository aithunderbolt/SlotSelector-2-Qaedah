# Quick Start: Per-Slot Maximum Registrations

## Installation (2 minutes)

### Run SQL Migration
Open Supabase SQL Editor and paste:

```sql
ALTER TABLE slots 
ADD COLUMN IF NOT EXISTS max_registrations INTEGER DEFAULT 15 NOT NULL;

ALTER TABLE slots 
ADD CONSTRAINT check_max_registrations_range 
CHECK (max_registrations >= 1 AND max_registrations <= 100);

UPDATE slots 
SET max_registrations = 15 
WHERE max_registrations IS NULL;
```

Click "Run" ✅

## Usage

### Set Max Registrations for a Slot

1. Login as super admin at `/admin`
2. Click "Slot Management" tab
3. Click "Edit" on any slot
4. Change "Maximum Registrations" (1-100)
5. Click "Save"

### Add New Slot with Custom Max

1. Click "+ Add New Slot"
2. Fill in slot details
3. Set "Maximum Registrations"
4. Click "Add Slot"

## What You'll See

### Slot Management Tab
- New "Max Registrations" column
- Orange badge showing each slot's limit
- Edit field when editing a slot

### Admin Dashboard
- Slot cards show "X/MAX" (e.g., "12/20")
- Each slot displays its own maximum
- Full slots turn red

### Registration Form
- Only shows available slots
- Hides slots that reached their individual maximum
- Updates in real-time

## Examples

### Different Capacities
```
Monday 5-6 PM: 20 students (large room)
Tuesday 5-6 PM: 10 students (small room)
Wednesday 5-6 PM: 15 students (medium room)
```

### Quick Setup
1. Edit Monday slot → Set max to 20
2. Edit Tuesday slot → Set max to 10
3. Edit Wednesday slot → Set max to 15
4. Done! Each slot now has its own limit

## Validation

- Minimum: 1
- Maximum: 100
- Required field
- Database constraint enforced

## Troubleshooting

**Not seeing the column?**
- Run the SQL migration
- Refresh the page

**Can't save changes?**
- Ensure value is between 1-100
- Check you're logged in as super admin

**Changes not reflecting?**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)

## That's It!

You now have per-slot maximum registrations. Each slot can have its own capacity, giving you complete flexibility.

For detailed documentation, see `PER_SLOT_MAX_REGISTRATIONS.md`
