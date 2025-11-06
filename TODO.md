# TODO: Fix Customer Uniqueness and Auto-Fill

## Issues Identified
- Frontend select uses mobileNumber as value, but auto-fill depends on selectedCustomerId (not set).
- Duplicate check in frontend only validates mobile if provided, but not name if mobile blank.
- Auto-fill not triggering on customer selection.
- getCustomerData finds customer by mobile, but should use selectedCustomerId.

## Plan
1. Change customer select to use _id as value and set selectedCustomerId on change.
2. Update auto-fill useEffect to trigger on selectedCustomerId.
3. Enhance duplicate check in handleAddCustomer: check mobile unique if provided, name unique if not.
4. Update loadData to set selectedCustomerId based on quotation data.
5. Update getCustomerData to use selectedCustomerId for finding customer.
6. Test the changes.

## Steps
- [x] Edit backend/controllers/customerController.js: Fix mobileNumber trimming and null handling.
- [x] Edit ProductCustomerSection.js: Add helper functions for fill and clear.
- [x] Edit ProductCustomerSection.js: Add auto-fill useEffect on selectedCustomerId.
- [x] Test the functionality.
