# Migration Guide: Global to Per-Slot Maximum Registrations

## What Changed?

**Before**: One global setting for all slots (e.g., all slots limited to 15)
**After**: Each slot has its own individual maximum registrations

## Why This Change?

- Different slots may have different capacities
- More flexibility for room sizes, teacher availability
- Better reflects real-world constraints
- Easier to manage individual slot capacities

## Migration Steps

### Step 1: Backup Your Data (Recommended)

Before making changes, backup your database:
```sql
-- Backup slots table
CREATE TABLE slots_backup AS SELECT * FROM slots;

-- Backup registrations table
CREATE TABLE registrations_backup AS SELECT * FROM registrations;
```

### Step 2: Run the Migration

Run this SQL in your Supabase SQL Editor:

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

### Step 3: Verify Migration

Check that all slots have the new column:
```sql
SELECT id, display_name, max_registrations 
FROM slots 
ORDER BY slot_order;
```

Expected result: All slots should show `max_registrations: 15`

### Step 4: Customize Individual Slots (Optional)

Now you can set different limits for different slots:

```sql
-- Example: Set different capacities
UPDATE slots SET max_registrations = 20 WHERE display_name LIKE '%Monday%';
UPDATE slots SET max_registrations = 10 WHERE display_name LIKE '%Advanced%';
UPDATE slots SET max_registrations = 25 WHERE display_name LIKE '%Beginner%';
```

Or use the admin dashboard:
1. Login as super admin
2. Go to "Slot Management" tab
3. Click "Edit" on any slot
4. Change "Maximum Registrations"
5. Click "Save"

### Step 5: Test the System

1. **Check Admin Dashboard**:
   - Verify each slot shows correct capacity (X/MAX)
   - Verify full slots are marked in red

2. **Check Registration Form**:
   - Verify only available slots are shown
   - Verify full slots are hidden

3. **Test Registration**:
   - Try registering for an available slot
   - Verify it works correctly

4. **Test Slot Editing**:
   - Edit a slot's max registrations
   - Verify changes reflect immediately

## What Happens to Existing Data?

### Existing Registrations
- **No changes** - All existing registrations remain valid
- **No data loss** - Nothing is deleted or modified
- **Backward compatible** - System continues to work

### Existing Slots
- All get default value of 15
- You can adjust individually as needed
- No disruption to current registrations

### Global Setting
- The global `max_registrations_per_slot` setting in the `settings` table is **no longer used**
- You can keep it for reference or remove it
- It won't affect the system anymore

## Rollback (If Needed)

If you need to rollback the migration:

```sql
-- Remove the column
ALTER TABLE slots DROP COLUMN IF EXISTS max_registrations;

-- Remove the constraint
ALTER TABLE slots DROP CONSTRAINT IF EXISTS check_max_registrations_range;

-- Restore from backup (if you created one)
-- DELETE FROM slots;
-- INSERT INTO slots SELECT * FROM slots_backup;
```

**Note**: After rollback, you'll need to revert the code changes as well.

## Code Changes Summary

### Files Modified
1. `src/components/SlotManagement.jsx` - Added max registrations field
2. `src/components/SlotManagement.css` - Added styling
3. `src/hooks/useSlotAvailability.js` - Uses per-slot values
4. `src/components/AdminDashboard.jsx` - Displays per-slot capacity

### Files Created
1. `add-max-registrations-to-slots.sql` - Migration script
2. `PER_SLOT_MAX_REGISTRATIONS.md` - Feature documentation
3. `MIGRATION_TO_PER_SLOT_MAX.md` - This guide

## Common Issues

### Issue: Column already exists
**Error**: `column "max_registrations" of relation "slots" already exists`
**Solution**: The migration already ran. Skip Step 2.

### Issue: Constraint violation
**Error**: `new row for relation "slots" violates check constraint`
**Solution**: Ensure max_registrations value is between 1 and 100.

### Issue: Null values
**Error**: `null value in column "max_registrations" violates not-null constraint`
**Solution**: Run the UPDATE statement from Step 2.

### Issue: Changes not reflecting
**Solution**: 
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

## Verification Checklist

- [ ] SQL migration completed successfully
- [ ] All slots have max_registrations value
- [ ] Constraint is in place (1-100 range)
- [ ] Admin dashboard shows per-slot capacity
- [ ] Slot Management tab shows max registrations column
- [ ] Can edit max registrations per slot
- [ ] Registration form shows only available slots
- [ ] Existing registrations still work
- [ ] Real-time updates work correctly

## Support

If you encounter issues:
1. Check the troubleshooting section in `PER_SLOT_MAX_REGISTRATIONS.md`
2. Verify SQL migration ran successfully
3. Check browser console for JavaScript errors
4. Verify Supabase connection is working
5. Check RLS policies on slots table

## Next Steps

After successful migration:
1. Review each slot's capacity
2. Adjust limits based on your needs
3. Test the registration flow
4. Inform users of any capacity changes
5. Monitor registration patterns
6. Adjust as needed

## Benefits of This Change

✅ **Flexibility**: Different slots can have different capacities
✅ **Accuracy**: Reflects real-world constraints
✅ **Control**: Fine-grained management
✅ **Scalability**: Easy to adjust individual slots
✅ **Better UX**: Students see accurate availability
