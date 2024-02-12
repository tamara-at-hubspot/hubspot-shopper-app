# Overview

An app for building shopping lists that can be associated with HubSpot records.

Example use cases:

- A maintenance company can track materials and calculate cost for property repair jobs.
- A catering company can track grocery lists for catering events.

Functionality:

- Create a new list from a record page (such as a deal page)
- Add an item to the list, specify unit price, quantity, and store
- Edit an item
- Remove an item
- Mark an item as bought
- Add other information such as order tracking number
- See a tally of material cost
- Assign a list to a shopper
- Send the list to the shopper by text or by email

# Development

## Local

Start the server in watch mode. As you start making changes, the server will automatically restart. This uses `ts-node` so there is no need to run `tsc`. Browse to http://localhost:3000 to use the app. Database writes go to `./db`.

```bash
$ npm ci
$ npm run dev:nodemon
```

## Docker

Build and run the server in Docker. Browse to http://localhost:3000 to use the app. Databases are created inside the container.

```bash
$ docker-compose up --build
```

# Notes

Next steps:

- [x] Use sqlite file db
- [x] Consolidate environment config
- [x] Handle token refresh
- [x] Dockerize
- [x] Add List table, associated with hubId, objectTypeId, objectId (0 or 1 list per record for now)
- [ ] Add Item table
- [ ] Add enpoint to retrieve list with items for a record
- [x] Add endpoint to create a list if there isn't one
- [ ] Add endpoint to update list items
- [ ] Add endpoint to delete a list
