# TODO: Fix Special Discount and Final Project Value Issues

## Backend Changes
- [x] Add specialDiscount and finalProjectValue fields to Quotation model
- [x] Update quotationController to handle new fields in create/update operations

## Frontend Changes
- [x] Modify Quotation.js to save/load specialDiscount and finalProjectValue
- [x] Update Quotation.js to pass these values to printData for PDF generation
- [x] Update Page.js to use passed values instead of local state
- [x] Remove editable inputs for special discount in Page.js
- [x] Improve Page.css spacing and layout
- [x] Remove unused useState import from Page.js

## Testing
- [ ] Test saving quotation with special discount
- [ ] Test loading quotation in view mode
- [ ] Test PDF generation with correct values
