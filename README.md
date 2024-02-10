An app for building shopping lists that can be associated with HubSpot records.

Example use cases:

- A maintenance company can track materials and calculate cost for property repair jobs.
- A catering company can track grocery lists for catering events.

Functionalities:

- Create a new list from a record page (such as a deal page)
- Add an item to the list, specify unit price, quantity, and store
- Edit an item
- Remove an item
- Mark an item as bought
- Add other information such as order tracking number
- See a tally of material cost
- Assign a list to a shopper
- Send the list to the shopper by text or by email

Next steps:
- [x] Use sqlite file db
- [x] Consolidate environment config
- [ ] Handle token refresh
- [ ] Dockerize
- [ ] Add List table, associated with hubId, objectTypeId, objectId (0 or 1 list per record for now)
- [ ] Add Item table
- [ ] Add enpoint to retrieve list with items for a record
- [ ] Add endpoint to create a list if there isn't one
- [ ] Add endpoint to update list items
- [ ] Add endpoint to delete a list
