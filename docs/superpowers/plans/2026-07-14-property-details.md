# BR-14 Property Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the property-details backend contract with authenticated ownership, ordered photo URLs, owner/admin authorization, safe public responses, migration verification, and green local/CI checks.

**Architecture:** Retain the existing Express route → controller → service → Prisma model flow. HTTP validation stays in the route, identity and authorization decisions live in the service, and database models perform nested atomic writes with a shared public Prisma selection. Public reads expose property data plus limited agent and ordered photo data while mutation endpoints derive the owner from the authenticated database user.

**Tech Stack:** Node.js 20, Express 4, express-validator 7, Prisma 5, MySQL 8, Vitest 4, Supertest, Swagger JSDoc, ESLint 9, Prettier 3, GitHub Actions.

---

## File Map

- `prisma/schema.prisma`: property enums, detail fields, ownership relation, photo relation, and timestamps.
- `prisma/migrations/20260714093227_add_property_details/migration.sql`: approved fixture reset and SQL schema migration.
- `src/models/user.model.js`: database lookup for the current JWT user ID.
- `src/models/property-model.js`: public selection, ownership lookup, nested photo create/update, and delete operations.
- `src/services/property-service.js`: normalization, current-user resolution, and owner/admin authorization.
- `src/controllers/property-controller.js`: validation handling, service result mapping, and HTTP responses.
- `src/routes/v1/properties.js`: create/update validators and OpenAPI request documentation.
- `src/swagger.js`: testable Swagger-spec creation.
- `test/properties.test.js`: expanded property integration tests.
- `test/auth-google-login.test.js`: Google-login property-creation regression coverage.
- `test/swagger.test.js`: OpenAPI contract assertions.
- `.github/workflows/ci.yml`: MySQL-backed migration, test, lint, and formatting checks.
- `README.md`: property contract and destructive fixture-migration warning.
- `package-lock.json`: synchronize the lockfile with the already-merged lint/format dependencies.

## Test Environment

Use the dedicated local database for every command in this plan:

```powershell
$env:DATABASE_URL='mysql://berrylistings:devpassword@127.0.0.1:3307/berrylistings_br14_test'
$env:JWT_SECRET='br14-test-secret'
$env:NODE_ENV='test'
```

Run Vitest directly on Windows (`npx vitest run ...`) because the repository's existing `npm test` script uses POSIX environment syntax. CI runs `npm test` on Ubuntu.

### Task 1: Establish authenticated property ownership

**Files:**
- Modify: `test/properties.test.js`
- Modify: `test/auth-google-login.test.js`
- Modify: `src/models/user.model.js`
- Modify: `src/services/property-service.js`
- Modify: `src/controllers/property-controller.js`
- Modify: `src/models/property-model.js`
- Modify: `src/routes/v1/properties.js`

- [ ] **Step 1: Replace hard-coded property tokens with real users and a complete payload**

Add Prisma/user setup and the reusable payload to `test/properties.test.js`:

```js
import { PrismaClient } from '@prisma/client';
import generateUniqueId from '../src/utils/unique-id.js';

const prisma = new PrismaClient();

const validPropertyPayload = (overrides = {}) => ({
    title: 'Maple Ridge Craftsman',
    description: 'A thoughtfully updated craftsman home.',
    price: '685000',
    type: 'HOUSE',
    status: 'ACTIVE',
    addressLine: '214 Maple Ridge Rd',
    city: 'Ashbourne',
    bedrooms: '4',
    bathrooms: '3',
    sqft: '2340',
    lotSizeAcres: '0.4',
    yearBuilt: '2018',
    amenities: ['Attached garage', 'Hardwood floors'],
    ...overrides,
});
```

In `beforeAll`, create an enabled owner with a unique email and sign `generateAccessToken({ id: owner.id, email: owner.email })`. In `afterAll`, delete properties owned by that user, delete the user, and disconnect Prisma. Replace the old three-field creation request with `validPropertyPayload()` and assert:

```js
expect(res.status).toBe(201);
expect(res.body.data.agent).toEqual({ uuid: owner.uuid, email: owner.email });
expect(res.body.data).not.toHaveProperty('id');
expect(res.body.data).not.toHaveProperty('agentId');
```

- [ ] **Step 2: Expand the Google-login property payload before changing production code**

Change the property request in `test/auth-google-login.test.js` to:

```js
.send(validPropertyPayload({
    title: 'From Google login',
    description: 'Created with a verified Google identity.',
    price: '100',
}))
```

Define the same `validPropertyPayload` fields locally in this test file so it is independently readable.

- [ ] **Step 3: Run both focused tests and verify the ownership contract is red**

Run:

```powershell
npx prisma migrate deploy
npx prisma generate
npx vitest run test/properties.test.js test/auth-google-login.test.js
```

Expected: the valid create requests fail with `400` because the current validator requires client-supplied `agentId`, proving the new ownership tests exercise missing behavior.

- [ ] **Step 4: Add current-user lookup**

Add to `src/models/user.model.js` and its default export:

```js
const getUserById = async (id) => {
    return prisma.user.findUnique({ where: { id } });
};
```

- [ ] **Step 5: Derive the agent from the authenticated database user**

In `src/services/property-service.js`, import `userModel` and add:

```js
const getEnabledActor = async (actorId) => {
    const id = Number(actorId);
    if (!Number.isInteger(id)) return null;

    const actor = await userModel.getUserById(id);
    return actor?.isEnabled ? actor : null;
};
```

Change creation to accept `(payload, actorId)`, return `{ error: 'forbidden' }` when the actor is unavailable, and otherwise call the model with normalized property data plus `agentId: actor.id`, returning `{ data }`.

- [ ] **Step 6: Map authenticated creation results in the controller**

Change `createProperty` in `src/controllers/property-controller.js` to:

```js
const result = await propertyService.createProperty(req.body, req.user.id);
if (result.error === 'forbidden') {
    return res.status(403).json({ error: 'Forbidden' });
}

res.status(201).json({ message: 'Property created successfully', data: result.data });
```

- [ ] **Step 7: Stop accepting client-supplied ownership**

In `src/routes/v1/properties.js`, remove `check('agentId').isInt()` and add:

```js
check('agentId').not().exists().withMessage('agentId is derived from authentication'),
```

Remove `agentId` from the OpenAPI request's required fields and properties.

- [ ] **Step 8: Return a safe owner shape after creation**

In `src/models/property-model.js`, define and use this selection for create:

```js
const publicPropertySelect = {
    uuid: true,
    title: true,
    description: true,
    price: true,
    type: true,
    status: true,
    addressLine: true,
    city: true,
    bedrooms: true,
    bathrooms: true,
    sqft: true,
    lotSizeAcres: true,
    yearBuilt: true,
    amenities: true,
    createdAt: true,
    updatedAt: true,
    agent: { select: { uuid: true, email: true } },
    photos: {
        select: { url: true, position: true },
        orderBy: { position: 'asc' },
    },
};
```

Pass `select: publicPropertySelect` to `prisma.property.create`.

- [ ] **Step 9: Run the focused tests and commit authenticated ownership**

Run:

```powershell
npx vitest run test/properties.test.js test/auth-google-login.test.js
```

Expected: property creation and Google-login creation pass; dependent legacy tests may still fail until their payloads and mutation expectations are replaced in later tasks.

Commit:

```powershell
git add test/properties.test.js test/auth-google-login.test.js src/models/user.model.js src/services/property-service.js src/controllers/property-controller.js src/models/property-model.js src/routes/v1/properties.js prisma/schema.prisma prisma/migrations/20260714093227_add_property_details/migration.sql
git commit -m "feat: derive property ownership from authenticated users (BR-14)"
```

### Task 2: Create and return ordered property photos

**Files:**
- Modify: `test/properties.test.js`
- Modify: `src/routes/v1/properties.js`
- Modify: `src/services/property-service.js`
- Modify: `src/models/property-model.js`

- [ ] **Step 1: Add a failing nested-photo creation assertion**

Add to the valid payload in `test/properties.test.js`:

```js
photos: [
    'https://images.example.com/maple-front.jpg',
    'https://images.example.com/maple-kitchen.jpg',
],
```

Assert the create response contains:

```js
expect(res.body.data.photos).toEqual([
    { url: 'https://images.example.com/maple-front.jpg', position: 0 },
    { url: 'https://images.example.com/maple-kitchen.jpg', position: 1 },
]);
```

- [ ] **Step 2: Run the creation test and verify red**

Run:

```powershell
npx vitest run test/properties.test.js -t "creates a property"
```

Expected: FAIL because the response has an empty `photos` array.

- [ ] **Step 3: Validate and normalize photo URL arrays**

Add validators in `src/routes/v1/properties.js`:

```js
check('photos').optional().isArray({ max: 20 }),
check('photos.*')
    .optional()
    .isURL({ protocols: ['http', 'https'], require_protocol: true }),
```

Add to `src/services/property-service.js`:

```js
const toPhotos = (photos) =>
    photos?.map((url, position) => ({ url: url.trim(), position }));
```

Pass `photos: toPhotos(payload.photos)` separately from scalar property data.

- [ ] **Step 4: Use Prisma nested photo creation**

Destructure `photos` in `propertyModel.createProperty` and add to `data`:

```js
photos: photos?.length ? { create: photos } : undefined,
```

Keep `select: publicPropertySelect` so the response returns ordered photo data.

- [ ] **Step 5: Run the focused test and commit**

Run:

```powershell
npx vitest run test/properties.test.js -t "creates a property"
```

Expected: PASS with both photos in input order.

Commit:

```powershell
git add test/properties.test.js src/routes/v1/properties.js src/services/property-service.js src/models/property-model.js
git commit -m "feat: create ordered property photos (BR-14)"
```

### Task 3: Return safe relations from public reads

**Files:**
- Modify: `test/properties.test.js`
- Modify: `src/models/property-model.js`

- [ ] **Step 1: Add relation-shape assertions to list and detail tests**

For both public endpoints, assert:

```js
expect(property.agent).toEqual({ uuid: owner.uuid, email: owner.email });
expect(property.photos).toEqual([
    { url: 'https://images.example.com/maple-front.jpg', position: 0 },
    { url: 'https://images.example.com/maple-kitchen.jpg', position: 1 },
]);
expect(property).not.toHaveProperty('id');
expect(property).not.toHaveProperty('agentId');
```

- [ ] **Step 2: Run public-read tests and verify red**

Run:

```powershell
npx vitest run test/properties.test.js -t "lists properties|fetches a property"
```

Expected: FAIL because `findMany` and `findUnique` currently return scalar rows without `agent` or `photos` and expose internal IDs.

- [ ] **Step 3: Apply the public selection to reads**

Change model reads to:

```js
const getPropertyList = async () =>
    prisma.property.findMany({
        select: publicPropertySelect,
        orderBy: { createdAt: 'desc' },
    });

const getPropertyByUuid = async (uuid) =>
    prisma.property.findUnique({
        where: { uuid },
        select: publicPropertySelect,
    });
```

- [ ] **Step 4: Run tests and commit**

Run:

```powershell
npx vitest run test/properties.test.js -t "lists properties|fetches a property"
```

Expected: PASS with safe agent and ordered photo relations.

Commit:

```powershell
git add test/properties.test.js src/models/property-model.js
git commit -m "feat: expose safe property relations (BR-14)"
```

### Task 4: Enforce owner/admin updates and photo replacement semantics

**Files:**
- Modify: `test/properties.test.js`
- Modify: `src/models/property-model.js`
- Modify: `src/services/property-service.js`
- Modify: `src/controllers/property-controller.js`

- [ ] **Step 1: Create other, admin, and disabled actors in test setup**

Create three additional users in `beforeAll`: enabled `USER`, enabled `ADMIN`, and disabled `USER`. Sign tokens using their real numeric IDs. Delete them after their owned properties are removed in `afterAll`.

- [ ] **Step 2: Add failing authorization tests**

Add tests asserting:

```js
expect(nonOwnerUpdate.status).toBe(403);
expect(disabledOwnerUpdate.status).toBe(403);
expect(adminUpdate.status).toBe(200);
```

Use `validPropertyPayload({ title: 'Admin updated' })` for full PUT bodies.

- [ ] **Step 3: Run authorization tests and verify red**

Run:

```powershell
npx vitest run test/properties.test.js -t "non-owner|disabled user|administrator"
```

Expected: at least the non-owner request returns `200`, proving ownership enforcement is missing.

- [ ] **Step 4: Add an internal ownership lookup**

Add to `src/models/property-model.js`:

```js
const getPropertyOwnership = async (uuid) =>
    prisma.property.findUnique({
        where: { uuid },
        select: { uuid: true, agentId: true },
    });
```

Export it for service use only; HTTP responses continue using `publicPropertySelect`.

- [ ] **Step 5: Authorize mutation in the service**

Add:

```js
const canMutate = (actor, property) =>
    actor.role === 'ADMIN' || actor.id === property.agentId;
```

Change `updateProperty(uuid, payload, actorId)` to resolve an enabled actor, fetch ownership, return `{ error: 'forbidden' }` or `{ error: 'not_found' }` as appropriate, and update only after `canMutate` succeeds.

- [ ] **Step 6: Map update results in the controller**

Pass `req.user.id` and map results exactly:

```js
if (result.error === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
if (result.error === 'not_found') return res.status(404).json({ message: 'Property not found' });

res.json({ message: `Property with id ${id} updated successfully`, data: result.data });
```

- [ ] **Step 7: Add failing photo replacement and preservation tests**

First update with:

```js
photos: ['https://images.example.com/replacement.jpg'],
```

Assert the response has only `{ url: 'https://images.example.com/replacement.jpg', position: 0 }`. Then send another full PUT body without `photos` and assert the replacement photo remains.

- [ ] **Step 8: Run photo update tests and verify red**

Run:

```powershell
npx vitest run test/properties.test.js -t "replaces photos|preserves photos"
```

Expected: FAIL because update currently does not modify nested photos.

- [ ] **Step 9: Implement atomic replace-or-preserve updates**

In `propertyModel.updateProperty`, use the UUID directly and build:

```js
const photoUpdate =
    photos === undefined
        ? {}
        : {
              photos: {
                  deleteMany: {},
                  create: photos,
              },
          };

return prisma.property.update({
    where: { uuid },
    data: { ...propertyData, ...photoUpdate },
    select: publicPropertySelect,
});
```

Pass `toPhotos(payload.photos)` from the service; `undefined` means preserve and `[]` means remove all photos.

- [ ] **Step 10: Run update coverage and commit**

Run:

```powershell
npx vitest run test/properties.test.js -t "updates a property|non-owner|disabled user|administrator|replaces photos|preserves photos"
```

Expected: all selected tests pass.

Commit:

```powershell
git add test/properties.test.js src/models/property-model.js src/services/property-service.js src/controllers/property-controller.js
git commit -m "feat: authorize property updates and replace photos (BR-14)"
```

### Task 5: Enforce owner/admin deletion and verify photo cascade

**Files:**
- Modify: `test/properties.test.js`
- Modify: `src/services/property-service.js`
- Modify: `src/controllers/property-controller.js`

- [ ] **Step 1: Add failing delete authorization tests**

Assert an enabled non-owner receives `403`, while an administrator receives `204` for a property created by the owner.

- [ ] **Step 2: Add a cascade assertion**

Before deletion, query the property's internal numeric ID in test setup and confirm two `PropertyPhoto` rows exist. After the authorized deletion, assert:

```js
expect(await prisma.propertyPhoto.count({ where: { propertyId } })).toBe(0);
```

- [ ] **Step 3: Run delete tests and verify red**

Run:

```powershell
npx vitest run test/properties.test.js -t "non-owner cannot delete|administrator can delete"
```

Expected: the non-owner deletion returns `204`, proving authorization is missing.

- [ ] **Step 4: Reuse mutation authorization for deletion**

Change `deleteProperty(uuid, actorId)` in the service to resolve the actor, fetch ownership, enforce `canMutate`, call the model only when authorized, and return `{ data: true }` or a tagged error.

- [ ] **Step 5: Map delete errors in the controller**

Pass `req.user.id`, return `403` for `forbidden`, `404` for `not_found`, and `204` only for a successful delete.

- [ ] **Step 6: Run tests and commit**

Run:

```powershell
npx vitest run test/properties.test.js -t "delete"
```

Expected: delete authorization and cascade tests pass.

Commit:

```powershell
git add test/properties.test.js src/services/property-service.js src/controllers/property-controller.js
git commit -m "feat: authorize property deletion (BR-14)"
```

### Task 6: Complete request validation and normalization

**Files:**
- Modify: `test/properties.test.js`
- Modify: `src/routes/v1/properties.js`
- Modify: `src/services/property-service.js`

- [ ] **Step 1: Add table-driven invalid-request tests**

Add cases for:

```js
const invalidDetailCases = [
    ['unknown type', { type: 'CASTLE' }],
    ['unknown status', { status: 'HIDDEN' }],
    ['negative bedrooms', { bedrooms: '-1' }],
    ['year before 1800', { yearBuilt: '1700' }],
    ['non-string amenity', { amenities: [42] }],
    ['photo without an HTTP protocol', { photos: ['not-a-url'] }],
    ['more than twenty photos', { photos: Array.from({ length: 21 }, (_, i) => `https://images.example.com/${i}.jpg`) }],
    ['client-supplied agent', { agentId: owner.id }],
];
```

Exercise them with:

```js
it.each(invalidDetailCases)('rejects invalid property detail: %s', async (_label, override) => {
    const res = await request(app)
        .post('/api/v1/properties')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ ...validPropertyPayload(), ...override });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run invalid-request tests and verify red**

Run:

```powershell
npx vitest run test/properties.test.js -t "rejects invalid property detail"
```

Expected: the amenity-element and/or photo cases are accepted, proving element validation is incomplete.

- [ ] **Step 3: Split shared validators into explicit create/update chains**

Use `body` from express-validator and define required scalar validators plus:

```js
body('amenities').optional().isArray({ max: 50 }),
body('amenities.*').optional().isString().trim().notEmpty(),
body('photos').optional().isArray({ max: 20 }),
body('photos.*')
    .optional()
    .isURL({ protocols: ['http', 'https'], require_protocol: true }),
body('agentId').not().exists().withMessage('agentId is derived from authentication'),
```

Both POST and PUT require the core property fields. Optional fields remain optional on both methods; PUT preserves omitted optional values.

- [ ] **Step 4: Normalize only provided optional values**

Build scalar data without undefined keys. Trim title, description, address, city, and amenities. Convert numeric strings with `Number`/`Number.parseInt`; convert `''` and `null` for nullable lot size/year to `null`; omit optional keys that were not supplied so update preserves them.

- [ ] **Step 5: Run property tests and commit**

Run:

```powershell
npx vitest run test/properties.test.js
```

Expected: all property tests pass with no server errors or warnings.

Commit:

```powershell
git add test/properties.test.js src/routes/v1/properties.js src/services/property-service.js
git commit -m "test: cover property detail validation (BR-14)"
```

### Task 7: Make the OpenAPI contract testable and accurate

**Files:**
- Create: `test/swagger.test.js`
- Modify: `src/swagger.js`
- Modify: `src/routes/v1/properties.js`

- [ ] **Step 1: Write a failing Swagger contract test**

Create `test/swagger.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { createSwaggerSpec } from '../src/swagger.js';

describe('property OpenAPI contract', () => {
    it('documents the complete authenticated create payload', () => {
        const spec = createSwaggerSpec(3000);
        const operation = spec.paths['/api/v1/properties'].post;
        const schema = operation.requestBody.content['application/json'].schema;

        expect(operation.security).toEqual([{ bearerAuth: [] }]);
        expect(schema.required).toEqual(
            expect.arrayContaining([
                'title',
                'description',
                'price',
                'addressLine',
                'city',
                'bedrooms',
                'bathrooms',
                'sqft',
            ]),
        );
        expect(schema.required).not.toContain('agentId');
        expect(schema.properties.photos.items.format).toBe('uri');
        expect(schema.properties.amenities.items.type).toBe('string');
    });
});
```

- [ ] **Step 2: Run the test and verify red**

Run:

```powershell
npx vitest run test/swagger.test.js
```

Expected: FAIL because `createSwaggerSpec` is not exported and photo documentation is absent.

- [ ] **Step 3: Export deterministic Swagger generation**

Refactor `src/swagger.js` so:

```js
const createDefinition = (port) => ({
    openapi: '3.0.0',
    info: {
        title: 'Property Listings API',
        version: '1.0.0',
        description: 'API documentation for property listings',
    },
    servers: [{ url: `http://localhost:${port}` }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
});

export const createSwaggerSpec = (port) =>
    swaggerJsdoc({
        definition: createDefinition(port),
        apis: ['./src/routes/v1/*.js'],
    });
```

`swaggerDocs(app, port)` calls `createSwaggerSpec(port)` and otherwise preserves current behavior.

- [ ] **Step 4: Complete POST and PUT property schemas**

Document all required and optional fields, enum values, nullable number/year fields, string-array amenities, and URI-array photos. Document `400`, `401`, `403`, `404`, and `500` responses where applicable. Do not document `agentId` as request input.

- [ ] **Step 5: Run the Swagger and property tests, then commit**

Run:

```powershell
npx vitest run test/swagger.test.js test/properties.test.js
```

Expected: both files pass.

Commit:

```powershell
git add test/swagger.test.js src/swagger.js src/routes/v1/properties.js
git commit -m "docs: complete property OpenAPI contract (BR-14)"
```

### Task 8: Verify the destructive fixture migration and document it

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/migrations/20260714093227_add_property_details/migration.sql`
- Modify: `README.md`

- [ ] **Step 1: Validate Prisma schema consistency**

Run:

```powershell
npx prisma format
npx prisma validate
```

Expected: schema formatting completes and validation reports that the schema is valid.

- [ ] **Step 2: Create a clean migration-verification database**

Run:

```powershell
docker exec berrylistings-db-1 mysql -uroot -pdevpassword -e "DROP DATABASE IF EXISTS berrylistings_br14_migration; CREATE DATABASE berrylistings_br14_migration CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON berrylistings_br14_migration.* TO 'berrylistings'@'%';"
git worktree add --detach C:\Users\asrul\.config\superpowers\worktrees\BerryListings\br-14-migration-baseline main
$env:DATABASE_URL='mysql://berrylistings:devpassword@127.0.0.1:3307/berrylistings_br14_migration'
npx prisma migrate deploy --schema C:\Users\asrul\.config\superpowers\worktrees\BerryListings\br-14-migration-baseline\prisma\schema.prisma
```

Expected: the four pre-BR-14 migrations apply successfully.

- [ ] **Step 3: Insert a legacy fixture**

Run:

```powershell
docker exec berrylistings-db-1 mysql -uberrylistings -pdevpassword berrylistings_br14_migration -e "INSERT INTO Property (uuid, title, description, price) VALUES ('legacy-property-fixture', 'Legacy Fixture', 'Pre-BR-14 fixture', 100000); SELECT COUNT(*) AS property_count_before FROM Property;"
```

Expected: `property_count_before` is `1`.

- [ ] **Step 4: Apply BR-14 over the legacy fixture**

Run from the feature worktree:

```powershell
npx prisma migrate deploy
npx prisma generate
docker exec berrylistings-db-1 mysql -uberrylistings -pdevpassword berrylistings_br14_migration -e "SELECT COUNT(*) AS property_count_after FROM Property; SHOW TABLES LIKE 'PropertyPhoto';"
```

Expected: the BR-14 migration succeeds, `property_count_after` is `0`, and the `PropertyPhoto` table exists, demonstrating the approved fixture reset and new relation.

- [ ] **Step 5: Remove the temporary detached worktree**

Run:

```powershell
git worktree remove C:\Users\asrul\.config\superpowers\worktrees\BerryListings\br-14-migration-baseline
$env:DATABASE_URL='mysql://berrylistings:devpassword@127.0.0.1:3307/berrylistings_br14_test'
```

- [ ] **Step 6: Document the migration warning and API fields**

Add a `Property details (BR-14)` README section listing the request fields, explaining that ownership comes from the bearer token, and warning that migration `20260714093227_add_property_details` deletes pre-agent development fixtures and must not be applied to real property data without a backfill migration.

- [ ] **Step 7: Commit migration verification changes**

Run:

```powershell
git add prisma/schema.prisma prisma/migrations/20260714093227_add_property_details/migration.sql README.md
git commit -m "docs: document BR-14 migration contract"
```

### Task 9: Add repeatable pull-request CI

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `package-lock.json`

- [ ] **Step 1: Confirm a clean install now has a synchronized lockfile**

Run:

```powershell
npm install
npm ci --ignore-scripts
```

Expected: both commands exit `0`; `package-lock.json` contains the ESLint, Prettier, Husky, and lint-staged packages declared in `package.json`.

- [ ] **Step 2: Add the CI workflow**

Create `.github/workflows/ci.yml` with:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8
        env:
          MYSQL_ROOT_PASSWORD: devpassword
          MYSQL_DATABASE: berrylistings_test
          MYSQL_USER: berrylistings
          MYSQL_PASSWORD: devpassword
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping -h 127.0.0.1 -uberrylistings -pdevpassword"
          --health-interval=5s
          --health-timeout=5s
          --health-retries=20
    env:
      DATABASE_URL: mysql://berrylistings:devpassword@127.0.0.1:3306/berrylistings_test
      JWT_SECRET: ci-test-secret
      NODE_ENV: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npx prisma generate
      - run: npm test
      - run: npm run lint
      - run: npm run format:check
```

- [ ] **Step 3: Run the same verification sequence locally**

Run:

```powershell
npx prisma migrate deploy
npx prisma generate
npx vitest run
npm run lint
npm run format:check
```

Expected: every command exits `0`.

- [ ] **Step 4: Commit CI and lockfile synchronization**

Run:

```powershell
git add .github/workflows/ci.yml package-lock.json
git commit -m "ci: verify migrations tests and code quality"
```

### Task 10: Final verification, review, PR, approval, merge, and Jira completion

**Files:**
- Review: all BR-14 changes
- Update through external workflow: GitHub PR and Jira BR-14

- [ ] **Step 1: Run fresh full verification**

Run:

```powershell
$env:DATABASE_URL='mysql://berrylistings:devpassword@127.0.0.1:3307/berrylistings_br14_test'
$env:JWT_SECRET='br14-test-secret'
$env:NODE_ENV='test'
npx prisma validate
npx prisma migrate deploy
npx prisma generate
npx vitest run
npm run lint
npm run format:check
git diff --check main...HEAD
```

Expected: all commands exit `0`, all tests pass, and Git reports no whitespace errors.

- [ ] **Step 2: Review the final diff against the design**

Run:

```powershell
git diff --stat main...HEAD
git diff main...HEAD
git status --short --branch
```

Confirm every design goal maps to code/tests and no unrelated feature work is present.

- [ ] **Step 3: Push and open a draft PR**

Push `feat/br-14-property-details` to `origin` and open a draft PR targeting `main`. The PR body must summarize schema/API behavior, ownership and photo semantics, destructive fixture migration, test evidence, and include `Jira: BR-14`.

- [ ] **Step 4: Wait for GitHub CI and address failures test-first**

Use `gh pr checks --watch` and inspect full Actions logs for any failure. For a code failure, reproduce it locally, add or confirm the failing test, implement the minimal fix, rerun full verification, commit, and push.

- [ ] **Step 5: Request and perform code review**

Review the PR diff for correctness, security boundaries, migration safety, test quality, and scope. Address every actionable finding with its own verified commit. Mark the draft PR ready only after review findings are resolved.

- [ ] **Step 6: Approve and merge**

Confirm all required checks are green and the PR is mergeable. Approve through the available GitHub account when GitHub permits self-approval; if GitHub blocks self-approval, record the completed review in the PR and proceed under the repository's actual protection rules. Merge using the repository's established merge-commit strategy.

- [ ] **Step 7: Complete Jira and synchronize local state**

Add the merged PR link and verification summary to BR-14, transition it through review to its completed status, pull `origin/main`, and confirm the merge commit contains the BR-14 changes.
