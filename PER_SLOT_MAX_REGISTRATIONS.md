# Per-Slot Maximum Registrations Feature

## Overview
This feature allows super admins to set individual maximum registration limits for each time slot. Each slot can have its own capacity, providing flexibility for different class sizes or room capacities.

## Key Features

✅ **Individual Slot Limits**: Each slot has its own maximum registrations setting
✅ **Flexible Capacity**: Different slots can have different capacities (e.g., Slot A: 20, Slot B: 10)
✅ **Super Admin Control**: Managed from the Slot Management tab
✅ **Real-time Updates**: Changes take effect immediately across the system
✅ **Validation**: Enforces limits between 1-100 per slot
✅ **Default Value**: New slots default to 15 registrations
✅ **Database Constraint**: Check constraint ensures valid values

## Installation

### Step 1: Run SQL Migration

Run this in your Supabase SQL Editor:

```sql
-- Add max_registrations column to slots table
ALTER TABLE slots 
ADD COLUMN IF NOT EXISTS max_registrations INTEGER DEFAULT 15 NOT NULL;

-- Add check constraint to ensure valid values (1-100)
ALTER TABLE slots 
ADD CONSTRAINT check_max_registrations_range 
CHECK (max_registrations >= 1 AND max_registrations <= 100);

-- Update existing slots to have the default value
UPDATE slots 
SET max_registrations = 15 
WHERE max_registrations IS NULL;
```

### Step 2: Verify Installation

1. Login as super admin
2. Navigate to "Slot Management" tab
3. You should see a "Max Registrations" column in the slots table

## How to Use

### Setting Max Registrations for New Slots

1. Login as super admin at `/admin`
2. Click "Slot Management" tab
3. Click "+ Add New Slot"
4. Fill in:
   - Slot Display Name
   - Slot Order
   - **Maximum Registrations** (1-100)
5. Click "Add Slot"

### Editing Max Registrations for Existing Slots

1. Login as super admin at `/admin`
2. Click "Slot Management" tab
3. Find the slot you want to edit
4. Click "Edit" button
5. Modify the "Maximum Registrations" field
6. Click "Save"

### Viewing Slot Capacity

**In Admin Dashboard:**
- Each slot card shows "X/MAX" format
- Example: "12/20" means 12 registrations out of 20 maximum
- Slots turn red when full

**In Registration Form:**
- Only slots below their individual maximum are shown
- Full slots are automatically hidden

## How It Works

### 1. Database Schema
- `slots` table now has `max_registrations` column
- Default value: 15
- Constraint: Must be between 1 and 100
- NOT NULL: Every slot must have a value

### 2. Slot Management Component
- Displays max registrations in table
- Allows editing per slot
- Validates input (1-100 range)
- Shows max as orange badge

### 3. Slot Availability Hook
- Fetches slots with their individual max_registrations
- Filters available slots based on each slot's limit
- No longer uses global setting

### 4. Admin Dashboard
- Displays each slot's capacity using its own max_registrations
- Shows "X/MAX" where MAX is slot-specific
- Marks slots as full based on individual limits

### 5. Registration Form
- Uses filtered slots from availability hook
- Only shows slots below their individual maximum
- Automatically updates when limits change

## Example Scenarios

### Scenario 1: Different Room Sizes
```
Monday 5-6 PM (Large Room): 25 students
Tuesday 5-6 PM (Small Room): 10 students
Wednesday 5-6 PM (Medium Room): 15 students
```

### Scenario 2: Teacher Availability
```
Slot with experienced teacher: 30 students
Slot with new teacher: 12 students
```

### Scenario 3: Special Sessions
```
Regular classes: 15 students each
Advanced class: 8 students (smaller group)
Beginner class: 20 students (larger group)
```

## Real-time Updates

When you change a slot's max registrations:

1. **Admin Dashboard** - Capacity display updates immediately
2. **Registration Form** - Slot availability updates automatically
3. **All Users** - See changes without page refresh
4. **Existing Registrations** - Remain valid (no data loss)

## Validation Rules

### When Adding/Editing Slots
- Max registrations must be a number
- Minimum value: 1
- Maximum value: 100
- Required field (cannot be empty)

### Database Level
- Check constraint enforces 1-100 range
- Prevents invalid values at database level
- Ensures data integrity

## Migration from Global Setting

If you previously used the global `max_registrations_per_slot` setting:

1. Run the SQL migration to add the column
2. All existing slots will get the default value (15)
3. Adjust individual slots as needed
4. The global setting is no longer used

**Note**: The Settings tab still has the global setting field, but it's now ignored. You can remove it if desired, or keep it for backward compatibility.

## Troubleshooting

### Slot not saving
- Check value is between 1-100
- Verify super admin permissions
- Check browser console for errors

### Changes not reflecting
- Verify SQL migration ran successfully
- Check slots table has `max_registrations` column
- Clear browser cache

### Slots showing wrong capacity
- Verify `max_registrations` value in database
- Check for null values (should default to 15)
- Refresh the page

## Database Queries

### View all slots with their max registrations
```sql
SELECT id, display_name, slot_order, max_registrations 
FROM slots 
ORDER BY slot_order;
```

### Update a specific slot's max registrations
```sql
UPDATE slots 
SET max_registrations = 20 
WHERE id = 'slot-id-here';
```

### Find slots that are full
```sql
SELECT s.display_name, s.max_registrations, COUNT(r.id) as current_count
FROM slots s
LEFT JOIN registrations r ON s.id = r.slot_id
GROUP BY s.id, s.display_name, s.max_registrations
HAVING COUNT(r.id) >= s.max_registrations;
```

## Files Modified

- `src/components/SlotManagement.jsx` - Added max registrations field
- `src/components/SlotManagement.css` - Added styling for max field
- `src/hooks/useSlotAvailability.js` - Uses per-slot max values
- `src/components/AdminDashboard.jsx` - Displays per-slot capacity
- `add-max-registrations-to-slots.sql` - Database migration

## Benefits

1. **Flexibility**: Different slots can have different capacities
2. **Accuracy**: Reflects real-world constraints (room size, teacher capacity)
3. **Control**: Fine-grained management per slot
4. **Scalability**: Easy to adjust individual slots without affecting others
5. **User Experience**: Students see accurate availability

## Best Practices

1. **Set realistic limits** based on:
   - Room capacity
   - Teacher availability
   - Equipment/resources
   - Quality of instruction

2. **Review regularly**:
   - Adjust based on demand
   - Consider feedback
   - Monitor registration patterns

3. **Communicate changes**:
   - Inform students of capacity changes
   - Update promotional materials
   - Keep stakeholders informed

4. **Plan for growth**:
   - Start conservative
   - Increase gradually
   - Monitor quality

## Future Enhancements

Possible future additions:
- Bulk edit max registrations for multiple slots
- Copy max registrations from one slot to another
- Historical tracking of capacity changes
- Automatic capacity recommendations based on demand
- Waitlist when slots are full
