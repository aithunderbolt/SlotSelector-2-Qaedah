# Maximum Registrations Validation

## Overview
When editing a slot's maximum registrations, the system validates that the new limit is not less than the current number of registrations for that slot.

## Validation Rules

### When Editing a Slot

The system checks:
1. **Current Registration Count**: Fetches the number of existing registrations for the slot
2. **Comparison**: Compares the new max value with the current count
3. **Validation**: If new max < current count, the update is rejected

### Error Message Format

```
Cannot set maximum to {new_value}. This slot currently has {current_count} registration(s). 
Please set a value of {current_count} or higher.
```

### Examples

#### Example 1: Valid Update
```
Current registrations: 12
Attempting to set max: 15
Result: ✅ Success - 15 is greater than 12
```

#### Example 2: Invalid Update
```
Current registrations: 18
Attempting to set max: 10
Result: ❌ Error - "Cannot set maximum to 10. This slot currently has 18 registrations. Please set a value of 18 or higher."
```

#### Example 3: Edge Case - Equal Value
```
Current registrations: 15
Attempting to set max: 15
Result: ✅ Success - 15 equals 15 (slot becomes full)
```

## User Flow

### Scenario: Trying to Reduce Capacity Below Current Count

1. **Admin opens Slot Management**
   - Sees Monday slot has 18/20 registrations

2. **Admin clicks Edit**
   - Tries to change max from 20 to 10

3. **Admin clicks Save**
   - System checks current count (18)
   - Compares with new max (10)
   - 10 < 18, so validation fails

4. **Error displayed**
   - Red error message appears at top
   - "Cannot set maximum to 10. This slot currently has 18 registrations. Please set a value of 18 or higher."

5. **Admin corrects**
   - Changes max to 18 or higher
   - Clicks Save
   - ✅ Success!

## Why This Validation?

### Data Integrity
- Prevents logical inconsistencies
- Ensures slot capacity always >= current registrations
- Maintains system reliability

### User Experience
- Clear error messages
- Explains why the action failed
- Suggests the minimum valid value

### Business Logic
- Can't "un-register" students by reducing capacity
- Existing registrations are protected
- Admin must manually remove registrations first if needed

## Technical Implementation

### Code Location
`src/components/SlotManagement.jsx` - `handleSave` function

### Validation Logic
```javascript
// Check current registration count for this slot
const { data: registrations, error: countError } = await supabase
  .from('registrations')
  .select('id')
  .eq('slot_id', slotId);

const currentCount = registrations?.length || 0;

if (maxReg < currentCount) {
  setError(`Cannot set maximum to ${maxReg}. This slot currently has ${currentCount} registration${currentCount !== 1 ? 's' : ''}. Please set a value of ${currentCount} or higher.`);
  return;
}
```

### Error Handling
- Error displayed at top of Slot Management section
- Red background with white text
- Persists until user takes action (edit, cancel, or successful save)
- Cleared when starting a new edit

## Edge Cases

### Case 1: Slot with 0 Registrations
```
Current: 0 registrations
New max: Any value 1-100
Result: ✅ Always valid
```

### Case 2: Slot at Capacity
```
Current: 15/15 registrations
New max: 15
Result: ✅ Valid (slot remains full)
New max: 14
Result: ❌ Invalid
New max: 16
Result: ✅ Valid (slot has 1 space)
```

### Case 3: Slot Over Capacity (shouldn't happen, but handled)
```
Current: 20 registrations (somehow)
New max: 19
Result: ❌ Invalid - must be 20 or higher
```

## Workaround: Reducing Capacity

If you need to reduce a slot's capacity below current registrations:

### Option 1: Wait for Natural Reduction
1. Set max to current count (makes slot full)
2. Wait for registrations to drop naturally
3. Then reduce max further

### Option 2: Manual Removal (Future Feature)
1. Remove some registrations manually
2. Then reduce max capacity
3. (Note: Manual removal feature not yet implemented)

### Option 3: Database Direct (Advanced)
```sql
-- Only if absolutely necessary
-- First, manually handle the excess registrations
-- Then update the slot
UPDATE slots SET max_registrations = 10 WHERE id = 'slot-id';
```

## Testing

### Test Case 1: Valid Reduction
1. Create slot with max 20
2. Add 10 registrations
3. Try to set max to 15
4. Expected: ✅ Success

### Test Case 2: Invalid Reduction
1. Create slot with max 20
2. Add 15 registrations
3. Try to set max to 10
4. Expected: ❌ Error message

### Test Case 3: Exact Match
1. Create slot with max 20
2. Add 15 registrations
3. Try to set max to 15
4. Expected: ✅ Success (slot becomes full)

### Test Case 4: Increase Always Valid
1. Any slot with any registrations
2. Increase max to any higher value
3. Expected: ✅ Always succeeds

## Error Message Variations

### Singular
```
Cannot set maximum to 5. This slot currently has 1 registration. 
Please set a value of 1 or higher.
```

### Plural
```
Cannot set maximum to 5. This slot currently has 12 registrations. 
Please set a value of 12 or higher.
```

## Benefits

✅ **Prevents Data Inconsistency**: Can't have more registrations than capacity
✅ **Clear Feedback**: User knows exactly why it failed and what to do
✅ **Protects Existing Data**: Existing registrations are safe
✅ **Business Logic**: Enforces sensible capacity management
✅ **User-Friendly**: Suggests the minimum valid value

## Future Enhancements

Possible improvements:
- Show current registration count in edit form
- Warning when setting max close to current count
- Bulk capacity adjustment with validation
- Option to move excess registrations to another slot
- Waitlist feature for full slots
