# Deployment Checklist: Per-Slot Maximum Registrations

## Pre-Deployment

### 1. Backup Database
- [ ] Backup `slots` table
- [ ] Backup `registrations` table
- [ ] Backup `users` table
- [ ] Save backup SQL file

### 2. Review Changes
- [ ] Read `PER_SLOT_MAX_REGISTRATIONS.md`
- [ ] Read `MIGRATION_TO_PER_SLOT_MAX.md`
- [ ] Understand the feature
- [ ] Review SQL migration script

### 3. Test Environment (Optional but Recommended)
- [ ] Set up test Supabase project
- [ ] Run migration on test database
- [ ] Test the feature in test environment
- [ ] Verify no issues

## Deployment Steps

### Step 1: Database Migration
- [ ] Open Supabase SQL Editor
- [ ] Copy contents of `add-max-registrations-to-slots.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify success message
- [ ] Check for errors

### Step 2: Verify Database Changes
- [ ] Run: `SELECT * FROM slots LIMIT 1;`
- [ ] Confirm `max_registrations` column exists
- [ ] Confirm default value is 15
- [ ] Check constraint is in place

### Step 3: Deploy Code Changes
- [ ] Pull latest code changes
- [ ] Run `npm install` (if needed)
- [ ] Run `npm run build`
- [ ] Deploy to hosting service
- [ ] Wait for deployment to complete

### Step 4: Verify Deployment
- [ ] Visit your site
- [ ] Check registration form loads
- [ ] Login as super admin
- [ ] Navigate to Slot Management tab
- [ ] Verify "Max Registrations" column visible

## Post-Deployment Testing

### Test 1: View Slot Management
- [ ] Login as super admin
- [ ] Go to Slot Management tab
- [ ] See "Max Registrations" column
- [ ] All slots show default value (15)
- [ ] Orange badges display correctly

### Test 2: Edit Existing Slot
- [ ] Click "Edit" on a slot
- [ ] See "Max Registrations" field
- [ ] Change value to 20
- [ ] Click "Save"
- [ ] Verify value updated in table
- [ ] Check orange badge shows 20

### Test 3: Add New Slot
- [ ] Click "+ Add New Slot"
- [ ] Fill in slot name and order
- [ ] Set max registrations to 25
- [ ] Click "Add Slot"
- [ ] Verify new slot appears
- [ ] Check max registrations is 25

### Test 4: Admin Dashboard
- [ ] Go to Registrations tab
- [ ] Check slot cards
- [ ] Verify each shows "X/MAX" format
- [ ] Verify MAX matches slot's setting
- [ ] Check full slots are marked red

### Test 5: Registration Form
- [ ] Logout from admin
- [ ] Go to registration form
- [ ] Check available slots
- [ ] Verify only non-full slots shown
- [ ] Try registering for a slot
- [ ] Verify registration works

### Test 6: Real-time Updates
- [ ] Open admin dashboard in Browser 1
- [ ] Open admin dashboard in Browser 2
- [ ] Edit slot max in Browser 1
- [ ] Verify Browser 2 updates automatically
- [ ] No page refresh needed

### Test 7: Validation
- [ ] Try setting max to 0 → Should fail
- [ ] Try setting max to -1 → Should fail
- [ ] Try setting max to 101 → Should fail
- [ ] Try setting max to "abc" → Should fail
- [ ] Try setting max to 50 → Should succeed

### Test 8: Slot Admin Access
- [ ] Login as slot admin
- [ ] Verify cannot access Slot Management tab
- [ ] Verify can see registrations
- [ ] Verify capacity display works

### Test 9: Different Capacities
- [ ] Set Slot 1 max to 20
- [ ] Set Slot 2 max to 10
- [ ] Set Slot 3 max to 15
- [ ] Verify admin dashboard shows different maxes
- [ ] Verify registration form respects limits

### Test 10: Edge Cases
- [ ] Slot with 0 registrations
- [ ] Slot at exactly max capacity
- [ ] Slot over capacity (if any)
- [ ] Slot with very high max (e.g., 100)
- [ ] Slot with minimum max (1)

## Rollback Plan (If Needed)

### If Issues Occur
1. [ ] Note the specific issue
2. [ ] Check browser console for errors
3. [ ] Check Supabase logs
4. [ ] Decide: Fix forward or rollback?

### To Rollback Database
```sql
-- Remove column
ALTER TABLE slots DROP COLUMN IF EXISTS max_registrations;

-- Remove constraint
ALTER TABLE slots DROP CONSTRAINT IF EXISTS check_max_registrations_range;
```

### To Rollback Code
1. [ ] Revert to previous git commit
2. [ ] Rebuild: `npm run build`
3. [ ] Redeploy

## Post-Deployment Tasks

### Immediate
- [ ] Monitor for errors (first 30 minutes)
- [ ] Check user feedback
- [ ] Verify all features working
- [ ] Test on mobile devices

### Within 24 Hours
- [ ] Review slot capacities
- [ ] Adjust limits if needed
- [ ] Monitor registration patterns
- [ ] Check for any issues

### Within 1 Week
- [ ] Gather user feedback
- [ ] Optimize capacities
- [ ] Document any issues
- [ ] Plan improvements

## Communication

### Notify Stakeholders
- [ ] Inform super admins of new feature
- [ ] Send usage instructions
- [ ] Provide documentation links
- [ ] Offer training if needed

### Update Documentation
- [ ] Update internal wiki
- [ ] Update training materials
- [ ] Update user guides
- [ ] Share best practices

## Success Criteria

✅ Database migration successful
✅ All tests passing
✅ No JavaScript errors
✅ Real-time updates working
✅ Validation working correctly
✅ Admin dashboard displays correctly
✅ Registration form works correctly
✅ Slot admin access unchanged
✅ No breaking changes
✅ Performance acceptable

## Support

### If Issues Arise
1. Check `PER_SLOT_MAX_REGISTRATIONS.md` troubleshooting section
2. Review browser console errors
3. Check Supabase logs
4. Verify database schema
5. Test in incognito mode
6. Clear browser cache

### Common Issues
- **Column not showing**: Run migration again
- **Validation errors**: Check value range (1-100)
- **Not saving**: Check super admin permissions
- **Not updating**: Clear cache, hard refresh

## Notes

- Migration is backward compatible
- Existing registrations not affected
- Default value is 15 for all slots
- Can adjust individual slots after deployment
- No downtime required
- Real-time updates work immediately

## Sign-off

- [ ] Database migration completed by: _______________
- [ ] Code deployment completed by: _______________
- [ ] Testing completed by: _______________
- [ ] Approved by: _______________
- [ ] Date: _______________

## Deployment Complete! 🎉

Once all checkboxes are marked, the feature is successfully deployed and ready for use.
