# BR-14 Property Details Backend Design

**Status:** Approved on 2026-07-14
**Ticket:** [BR-14](https://ixawave.atlassian.net/browse/BR-14)
**Branch:** `feat/br-14-property-details`

## Context

The static `berrylistings-ui` prototype defines a richer property presentation than the current API supports. Claude began expanding the backend schema and property endpoints, but the work stopped with an uncommitted migration, incomplete photo handling, client-supplied ownership, and failing property tests.

BR-14 completes that backend contract while retaining the repository's existing Express controller/service/model layering. It does not connect the separate static UI to the API; that integration remains a follow-up feature.

## Goals

- Represent the property details already present in the UI: type, status, address, city, bedrooms, bathrooms, square footage, lot size, year built, amenities, agent, photos, and timestamps.
- Derive listing ownership from the authenticated user rather than trusting an `agentId` supplied by clients.
- Allow only the owning agent or an administrator to update or delete a listing.
- Return ordered photos and safe agent data from public list and detail endpoints.
- Support atomic create and update operations for property fields and photos.
- Document the complete request contract in OpenAPI.
- Restore and expand automated coverage so the full repository test suite passes.
- Keep database migration behavior explicit and appropriate for the current fixture-only development database.

## Non-goals

- Connecting `berrylistings-ui` to the API.
- Uploading image binaries or integrating object storage; the API stores validated photo URLs.
- Adding search, filtering, sorting controls, or pagination.
- Creating a separate agent-profile domain with brokerage, phone, avatar, or licensing fields.
- Adding PATCH endpoints or changing the existing API version.

## Approaches Considered

### Minimal salvage

Update the tests to submit the newly required fields while leaving `agentId` in the request and leaving `PropertyPhoto` unused. This is quick but does not complete the behavior implied by the schema or UI and leaves ownership vulnerable to spoofing.

### Contract-first completion (selected)

Keep the current layers, make the authenticated user the owner, implement nested photo writes, include relations in public reads, and enforce owner/admin mutations. This completes the current design without introducing new resources or broad infrastructure.

### Resource expansion

Create separate photo endpoints, agent profiles, filtering, pagination, and upload infrastructure. This would be a stronger long-term platform but is unnecessary for BR-14 and would couple several independent features into one delivery.

## Data Model

`Property` gains:

- `type`: `HOUSE | CONDO | TOWNHOME | LAND`, default `HOUSE`
- `status`: `DRAFT | ACTIVE | PENDING | SOLD`, default `DRAFT`
- `addressLine` and `city`
- `bedrooms`, `bathrooms`, and `sqft`
- optional `lotSizeAcres` and `yearBuilt`
- optional JSON `amenities`, represented by the API as an array of strings
- `agentId`, relating the property to its owning `User`
- `createdAt` and `updatedAt`
- a one-to-many relationship to `PropertyPhoto`

`PropertyPhoto` contains an internal numeric ID, property ID, validated URL, and zero-based position. Deleting a property cascades to its photos.

## API Contract

### Public reads

`GET /api/v1/properties` and `GET /api/v1/properties/{id}` remain public. Each property includes:

- all public property scalar fields except the internal numeric `id` and `agentId`;
- `amenities` as an array or `null`;
- `photos` as `{ url, position }[]`, ordered by `position`;
- `agent` as `{ uuid, email }` only. Internal numeric user IDs, enablement state, and role are not exposed.

### Creation

`POST /api/v1/properties` requires authentication. The body contains:

- required: `title`, `description`, positive `price`, `addressLine`, `city`, non-negative `bedrooms`, `bathrooms`, and `sqft`;
- optional: `type`, `status`, nullable non-negative `lotSizeAcres`, nullable bounded `yearBuilt`, `amenities` as strings, and `photos` as URL strings;
- forbidden by omission from the contract: `agentId`.

The controller passes the authenticated JWT identity to the service. The model writes the property and ordered photos atomically using Prisma nested writes.

### Update

`PUT /api/v1/properties/{id}` requires authentication and continues to be a full update for the required property fields. Optional fields may be omitted. Ownership does not change.

If `photos` is present, existing photos are replaced atomically with the supplied ordered URL list. If `photos` is omitted, existing photos remain unchanged.

Only the owning agent or a user whose current database role is `ADMIN` may update the property.

### Deletion

`DELETE /api/v1/properties/{id}` requires authentication. Only the owning agent or an administrator may delete it. Photo rows are removed by the database cascade.

## Authentication and Authorization

JWTs already contain the internal user ID and email. Property mutation services load the current user from the database by ID so disabled or deleted users cannot create or mutate listings using an old token. The database record, not token claims supplied months earlier, is the source of truth for `isEnabled` and `role`.

Authorization outcomes are:

- `401` for a missing token;
- `403` for an invalid token, disabled/deleted caller, or a caller who does not own the listing and is not an administrator;
- `404` when the target property does not exist;
- `400` for request validation failures;
- `500` for unexpected persistence failures.

## Validation and Normalization

Express-validator owns the HTTP contract. The service normalizes validated numeric strings into numbers and converts empty nullable values to `null`. Amenities are trimmed non-empty strings. Photo entries are validated URLs, with a maximum of 20 photos per listing to bound nested writes.

Create and update use separate validation chains so defaults and optional replacement behavior are explicit. Swagger documents the same field requirements and response relationships as the validators.

## Migration Strategy

The current database contains only legacy fixtures that predate addresses and user ownership. The migration may delete existing `Property` rows rather than inventing addresses and owners. The destructive fixture reset is documented in the migration and BR-14.

The migration then adds the new columns, relations, enums, timestamps, photo table, and indexes. It must apply successfully to a database containing legacy fixture rows and to an empty database through the complete migration history.

This reset is not a production migration strategy. Any deployment containing real property data must stop and replace it with a staged nullable-column/backfill migration before applying BR-14.

## Testing

Integration tests use real Express routes and the MySQL-backed Prisma client. Test setup creates enabled users with actual database IDs, then signs tokens for those users.

Coverage includes:

- required and optional field validation;
- enum, numeric, amenities, year, and photo URL constraints;
- ownership derived from authentication;
- nested photo creation and deterministic ordering;
- public list and detail relation shapes;
- owner update and photo replacement/preservation behavior;
- non-owner denial and administrator override;
- deletion and photo cascade behavior;
- Google-login property creation using the expanded contract;
- migration application from the pre-BR-14 schema.

Every behavior change follows red-green-refactor: add a focused failing test, observe the expected failure, implement the smallest change, and rerun the relevant tests before moving on.

## Tooling and Delivery

The merged ESLint/Prettier package declarations are not fully represented in the current lockfile. The branch will retain the lockfile synchronization produced by `npm install` so clean installs and CI can run the required checks.

Delivery follows this sequence:

1. Commit this approved design and the implementation plan on `feat/br-14-property-details`.
2. Implement in small test-first commits referencing BR-14.
3. Run the complete migration, test, lint, and formatting verification locally.
4. Push the branch and open a draft pull request linked to BR-14.
5. Wait for GitHub checks, address actionable review findings, and mark the PR ready.
6. Approve and merge only after required checks are green and the final diff matches this design.
7. Transition BR-14 through review to its completed workflow state and synchronize the local default branch.
