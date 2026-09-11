# Shipment Tracker

A full-stack shipment tracking application built as a practical assignment for a Junior Full Stack Developer position.

The application allows operations users to view shipments, filter them, inspect shipment history, create shipments for existing customers, record transport events, make new events, and identify late shipments.

## Tech Stack

### Frontend

* Angular
* TypeScript
* HTML / CSS

### Backend

* Node.js
* Express
* TypeScript
* Zod

### Database

* PostgreSQL
* Prisma ORM

## Project Structure

```text
shipment-tracker/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── prisma/
│   │   └── app.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   └── app/
│   └── package.json
│
├── README.md
└── .gitignore
```

## Requirements

Before running the application, make sure you have:

* Node.js
* npm
* PostgreSQL

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/stanojkovicAndrija/shipment-tracker.git
cd shipment-tracker
```

### 2. Configure the backend

Go into the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example` and set the PostgreSQL connection string:

```env
DATABASE_URL=your_postgresql_connection_string
PORT=3000
```

The database should be running before starting the backend.

### 3. Start the backend

```bash
npm run dev
```

The API will run on:

```text
http://localhost:3000
```

Health check:

```text
GET http://localhost:3000/api/health
```

### 4. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm start
```

The Angular application will run on:

```text
http://localhost:4200
```

## Initial Data

The application uses preloaded customers and shipments so that the application has meaningful data immediately after setup.

Customers are intentionally not created through the UI. The assignment allows customers to be preloaded, and the main workflow starts from creating a shipment for an existing customer.

## Main Features

### Shipment List

The main page provides:

* All shipments
* Current shipment status
* Search by tracking number or destination
* Status filtering
* Late / on-time filtering
* Pagination
* Shipment statistics

### Shipment Details

Each shipment has a details page showing:

* Tracking number
* Customer
* Customer email
* Destination
* Promised delivery time
* Current status
* Transport event history

### Create Shipment

A new shipment can be created for an existing customer.

The form requires:

* Tracking number
* Customer
* Destination
* Promised delivery time

New shipments start in the `CREATED` state.

### Transport Events

A transport event can be recorded from the shipment details page.

The shipment follows a fixed state progression:

```text
CREATED
   ↓ PICKED_UP
PICKED_UP
   ↓ DEPARTED
DEPARTED
   ↓ ARRIVED_AT_HUB
AT_HUB
   ↓ OUT_FOR_DELIVERY
OUT_FOR_DELIVERY
   ↓ DELIVERED
DELIVERED
```

The backend validates the transition and prevents invalid state changes.

## Late Shipments

A shipment is considered late when:

```text
promisedAt < current time
AND
status != DELIVERED
```

The late status is calculated rather than stored in the database. This avoids having a separate `isLate` value that could become stale.

Late shipments are ordered by their promised delivery time, with the oldest missed promise shown first.

## API

### Shipments

```text
GET    /api/shipments
GET    /api/shipments/:id
POST   /api/shipments
GET    /api/shipments/:id/events
POST   /api/shipments/:id/events
GET    /api/shipments/stats
```

Supported shipment list filters:

```text
status
late
search
page
pageSize
```

### Customers

```text
GET /api/customers
```

Customers are read-only from the application because they are preloaded.

## Decisions

### 1. Customers are preloaded

The assignment states that customers may be preloaded and that a customer creation screen is not required.

I decided to keep customer creation outside the scope of the first version. The application provides existing customers when creating a shipment.

This keeps the main workflow focused on shipment operations.

### 2. Late shipments are calculated

I chose not to store an `isLate` field.

Late status depends on the current time, the promised delivery time, and whether the shipment has been delivered, so it is calculated when shipments are requested.

### 3. Shipment status transitions are restricted

A shipment cannot move directly between arbitrary states.

The backend owns the transition rules and only allows the next valid event for the current shipment status.

The frontend can provide a convenient UI, but the server remains authoritative.

### 4. Events and shipment status are tracked separately

A transport event represents something that happened during transportation, while the shipment status represents its current state.

For example:

```text
ARRIVED_AT_HUB event
        ↓
AT_HUB shipment status
```

Creating the event and updating the shipment status are performed in the same database transaction so that the two changes cannot be committed independently.

### 5. Invalid transport events

If an event does not match the shipment's current state, the backend rejects it.

For example, a shipment in `CREATED` cannot receive a `DELIVERED` event.

This validation is intentionally implemented on the server rather than relying only on frontend controls.

## Known Limitations

The current shipment list implementation loads all shipments into the backend and performs filtering, sorting, and pagination in application memory.

This is acceptable for the scope and expected data volume of the assignment, but it would not scale well to a large number of shipments.

The first improvement would be to move filtering, sorting, and pagination into PostgreSQL and add appropriate indexes.

For example, indexes could be added for fields commonly used for filtering or ordering, such as:

* `status`
* `promisedAt`
* `trackingNumber`

This would reduce the amount of data transferred from the database and processed by Node.js.

## What I Would Do With Two More Days

With two additional days, I would focus on improving the existing implementation rather than adding many new screens.

I would:

1. Move shipment filtering, sorting and pagination into PostgreSQL.
2. Add database indexes for the most frequently queried fields.
3. Add automated backend tests for shipment status transitions and late shipment logic.
4. Improve validation and error handling for edge cases.
5. Add a small set of frontend tests for the main shipment workflows.

I would keep authentication, user management and customer CRUD outside the scope unless they became necessary for the actual operational workflow.

## Deliberate Omissions

The following were intentionally left out because they were not required for the assignment:

* Authentication and login
* User management
* Customer creation/editing
* Deployment
* Advanced role/permission management

The goal of the first version was to keep the application focused on the operational shipment workflow described in the assignment.

## Summary

The application covers the main operational workflow from an existing customer to shipment creation, transport events, status progression, delivery, and identification of late shipments.

The backend contains the core shipment business rules, while the Angular frontend provides the operational interface for working with shipments.
