# UI Changes: Per-Slot Maximum Registrations

## Overview
This document shows the visual changes in the admin interface for the per-slot maximum registrations feature.

## 1. Slot Management Tab - Table View

### Before
```
| Slot Order | Display Name              | Actions      |
|------------|---------------------------|--------------|
| #1         | Monday - 5:00 PM to 6:00 PM | Edit Delete |
| #2         | Tuesday - 5:00 PM to 6:00 PM | Edit Delete |
```

### After
```
| Slot Order | Display Name              | Max Registrations | Actions      |
|------------|---------------------------|-------------------|--------------|
| #1         | Monday - 5:00 PM to 6:00 PM | [15]            | Edit Delete |
| #2         | Tuesday - 5:00 PM to 6:00 PM | [20]            | Edit Delete |
```

**New Column**: "Max Registrations" with orange badge showing the limit

## 2. Slot Management - Edit Mode

### Before
```
Edit Slot:
┌─────────────────────────────────────┐
│ Display Name:                       │
│ [Monday - 5:00 PM to 6:00 PM]      │
│                                     │
│ [Save] [Cancel]                     │
└─────────────────────────────────────┘
```

### After
```
Edit Slot:
┌─────────────────────────────────────┐
│ Display Name:                       │
│ [Monday - 5:00 PM to 6:00 PM]      │
│                                     │
│ Max Registrations:                  │
│ [15]                                │
│                                     │
│ [Save] [Cancel]                     │
└─────────────────────────────────────┘
```

**New Field**: "Max Registrations" input (1-100)

## 3. Slot Management - Add New Slot Form

### Before
```
Add New Slot
┌─────────────────────────────────────┐
│ Slot Display Name:                  │
│ [e.g., Monday - 5:00 PM to 6:00 PM]│
│                                     │
│ Slot Order:                         │
│ [e.g., 1, 2, 3...]                 │
│                                     │
│ [Add Slot] [Cancel]                 │
└─────────────────────────────────────┘
```

### After
```
Add New Slot
┌─────────────────────────────────────┐
│ Slot Display Name:                  │
│ [e.g., Monday - 5:00 PM to 6:00 PM]│
│                                     │
│ Slot Order:                         │
│ [e.g., 1, 2, 3...]                 │
│                                     │
│ Maximum Registrations:              │
│ [15]                                │
│ Maximum number of students for      │
│ this slot (1-100)                   │
│                                     │
│ [Add Slot] [Cancel]                 │
└─────────────────────────────────────┘
```

**New Field**: "Maximum Registrations" with helper text

## 4. Admin Dashboard - Slot Cards

### Before (All slots same limit)
```
┌─────────────────────┐  ┌─────────────────────┐
│ Monday 5-6 PM       │  │ Tuesday 5-6 PM      │
│                     │  │                     │
│      12/15          │  │      15/15          │
│                     │  │                     │
└─────────────────────┘  └─────────────────────┘
        (Available)              (Full - Red)
```

### After (Each slot has own limit)
```
┌─────────────────────┐  ┌─────────────────────┐
│ Monday 5-6 PM       │  │ Tuesday 5-6 PM      │
│                     │  │                     │
│      12/20          │  │      8/10           │
│                     │  │                     │
└─────────────────────┘  └─────────────────────┘
        (Available)              (Available)
```

**Change**: Each card shows its own maximum (20 vs 10)

## 5. Visual Indicators

### Slot Management Table

**Max Registrations Badge** (Orange):
```
[15]  [20]  [10]  [25]
```
- Orange background (#FF9800)
- White text
- Rounded corners
- Shows current max for each slot

### Admin Dashboard

**Capacity Display**:
```
Available Slot:  12/20  (Green/Normal)
Nearly Full:     18/20  (Yellow/Warning)
Full Slot:       20/20  (Red/Full)
```

## 6. Form Validation Messages

### When Adding/Editing Slots

**Valid Input**:
```
✓ Max registrations: 15
✓ Max registrations: 1
✓ Max registrations: 100
```

**Invalid Input**:
```
✗ Max registrations: 0
  → "Maximum registrations must be at least 1"

✗ Max registrations: 101
  → "Maximum registrations cannot exceed 100"

✗ Max registrations: (empty)
  → "Maximum registrations must be at least 1"

✗ Max registrations: abc
  → "Maximum registrations must be at least 1"
```

## 7. Responsive Design

### Desktop View
```
| Slot Order | Display Name              | Max Registrations | Actions      |
|------------|---------------------------|-------------------|--------------|
| #1         | Monday - 5:00 PM to 6:00 PM | [15]            | Edit Delete |
```

### Mobile View
```
┌─────────────────────────────────────┐
│ #1                                  │
│ Monday - 5:00 PM to 6:00 PM        │
│ Max: [15]                           │
│ [Edit]                              │
│ [Delete]                            │
└─────────────────────────────────────┘
```

## 8. Color Scheme

### Slot Management
- **Orange Badge** (#FF9800): Max registrations display
- **Green Border** (#4CAF50): Edit mode input fields
- **Blue Button** (#2196F3): Edit button
- **Red Button** (#f44336): Delete button

### Admin Dashboard
- **Normal Card**: White background
- **Selected Card**: Light blue highlight
- **Full Card**: Red tint (#ffebee)

## 9. Interactive States

### Edit Mode
```
Normal State:
┌─────────────────────────────────────┐
│ Max Registrations: [15]             │
└─────────────────────────────────────┘

Hover State:
┌─────────────────────────────────────┐
│ Max Registrations: [15] ← cursor    │
└─────────────────────────────────────┘

Focus State:
┌═════════════════════════════════════┐
║ Max Registrations: [15|]            ║ (Green border)
└═════════════════════════════════════┘

Error State:
┌─────────────────────────────────────┐
│ Max Registrations: [101]            │
│ ⚠ Maximum registrations cannot      │
│   exceed 100                        │
└─────────────────────────────────────┘
```

## 10. User Flow

### Setting Different Capacities

**Step 1**: Navigate to Slot Management
```
Admin Dashboard → [Slot Management Tab]
```

**Step 2**: Edit First Slot
```
Click [Edit] on Monday slot
Change Max Registrations: 15 → 20
Click [Save]
```

**Step 3**: Edit Second Slot
```
Click [Edit] on Tuesday slot
Change Max Registrations: 15 → 10
Click [Save]
```

**Step 4**: View Results
```
Admin Dashboard shows:
- Monday: 12/20 (available)
- Tuesday: 8/10 (available)
```

## 11. Real-time Updates

### Scenario: Admin changes slot capacity

**Admin Browser**:
```
1. Edit Monday slot
2. Change max: 15 → 20
3. Click Save
4. See: "12/20" immediately
```

**Student Browser** (simultaneously):
```
1. Viewing registration form
2. Monday slot was hidden (was 15/15)
3. Automatically appears (now 15/20)
4. Can now register
```

**No page refresh needed!**

## 12. Accessibility

### Keyboard Navigation
- Tab through form fields
- Enter to save
- Escape to cancel
- Arrow keys in number input

### Screen Reader Support
- Labels for all inputs
- Helper text read aloud
- Error messages announced
- Status updates announced

## 13. Summary of Visual Changes

✅ **New column** in Slot Management table
✅ **Orange badge** showing max registrations
✅ **Input field** in edit mode
✅ **Input field** in add form
✅ **Helper text** explaining the field
✅ **Validation messages** for invalid input
✅ **Per-slot capacity** in admin dashboard
✅ **Responsive design** for mobile
✅ **Real-time updates** without refresh

## 14. Before/After Comparison

### Slot Management Tab

**Before**: 3 columns (Order, Name, Actions)
**After**: 4 columns (Order, Name, **Max**, Actions)

### Add/Edit Forms

**Before**: 2 fields (Name, Order)
**After**: 3 fields (Name, Order, **Max Registrations**)

### Admin Dashboard

**Before**: All slots show same max (e.g., X/15)
**After**: Each slot shows its own max (e.g., X/20, Y/10, Z/15)

### Registration Form

**Before**: Slots hidden when reaching global limit
**After**: Slots hidden when reaching individual limit

## No Changes To

✅ Registration form layout
✅ Admin login page
✅ User management tab
✅ Settings tab
✅ Overall navigation
✅ Color scheme (except new orange badge)
✅ Existing functionality
