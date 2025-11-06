# TODO: Fix Designer, Manager, Reference Addition and Dropdown Display

## Steps to Complete

1. **Add new state variables in ProductCustomerSection.js**
   - Introduce `selectedReference`, `selectedDesigner`, `selectedManager` as strings for selected values.
   - Introduce `references`, `designers`, `managers` as arrays for the lists.

2. **Update useEffect to fetch and set arrays**
   - Modify fetch calls to set `setReferences`, `setDesigners`, `setManagers` with the fetched arrays.
   - Remove incorrect setting of `setReference` as array.

3. **Update select elements**
   - Change selects for reference, designer, manager to use `selectedReference`, etc., and map over `references`, etc.

4. **Update loadData function**
   - Set `selectedReference = quotationData.reference || "";` and similarly for designer and manager.

5. **Update getCustomerData function**
   - Return `reference: selectedReference,` etc., instead of the array.

6. **Fix reference modal**
   - Set `existingData={references}` and `onSuccess={(data) => setReferences(prev => [...prev, data])}`

7. **Add CSS class to add buttons**
   - Add `className="add-entity-btn"` to the "Add" buttons for designer, manager, reference.

8. **Update ProductCustomerSection.css**
   - Add styles for `.add-entity-btn` to match the customer add button styling.
