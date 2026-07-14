# BerryListings

A REST API for managing real estate property listings, built for a real estate agent client under the "Berry" brand.

## Tech Stack

- **Runtime:** Node.js (ESM), Express
- **Database:** MySQL via Prisma ORM
- **Auth:** Google OAuth login (`google-auth-library`) issuing JWTs (`jsonwebtoken`), bearer tokens
- **Docs:** Swagger / OpenAPI (`swagger-jsdoc` + `swagger-ui-express`)
- **Validation:** `express-validator`
- **Deployment:** Docker (see `Dockerfile`)

## Getting Started

### Prerequisites

- Node.js 20+
- A MySQL database

### Setup

```bash
npm install
```

Create a `.env` file with:

```
PORT=3000
DATABASE_URL=mysql://user:password@host:port/schema
DB_HOST=
DB_PORT=
DB_SCHEMA=
DB_USER=
DB_PASSWORD=
DB_NAME=
ADMIN_USER=
ADMIN_PASS=
JWT_SECRET=
GOOGLE_CLIENT_ID=
```

`GOOGLE_CLIENT_ID` is the OAuth 2.0 Client ID from a Google Cloud project (APIs & Services > Credentials). It's used to verify Google ID tokens on login.

Run migrations and start the server:

```bash
npx prisma migrate dev
npm run dev   # nodemon, for local development
npm start     # plain node, for production
```

The server listens on `PORT` (default `3000`).

### Docker

```bash
docker build -t berrylistings .
docker run -p 3000:3000 --env-file .env berrylistings
```

## Testing

```bash
npm test   # runs the vitest suite (unit + supertest integration tests)
```

The integration tests exercise the real routes/controllers against a live database, so run them with a database available, e.g. via `docker compose exec app npm test` (see `docker-compose.yml` for the local dev stack).

## API Documentation

Interactive Swagger UI is served at `/docs` once the server is running (e.g. `http://localhost:3000/docs`), with the raw OpenAPI spec at `/docs.json`.

## API Endpoints

| Method | Path                     | Auth required | Description            |
|--------|--------------------------|----------------|-------------------------|
| POST   | `/api/v1/auth/google`    | No             | Log in with a Google ID token, returns a bearer JWT |
| POST   | `/api/v1/properties`     | Yes            | Create a property       |
| GET    | `/api/v1/properties`     | No             | List properties         |
| GET    | `/api/v1/properties/:id`| No             | Get a property by id    |
| PUT    | `/api/v1/properties/:id`| Yes            | Update a property        |
| DELETE | `/api/v1/properties/:id`| Yes            | Delete a property        |
| POST   | `/api/v1/users`          | Yes (Admin)    | Create a user            |
| GET    | `/api/v1/users`          | Yes (Admin)    | List users                |
| GET    | `/api/v1/users/:id`      | Yes (Admin)    | Get a user by id          |
| PUT    | `/api/v1/users/:id`      | Yes (Admin)    | Update a user             |
| DELETE | `/api/v1/users/:id`      | Yes (Admin)    | Delete a user              |

## Authentication

Protected routes expect a `Bearer` JWT, signed with `JWT_SECRET`, in the `Authorization` header.

Log in via `POST /api/v1/auth/google` with a Google ID token (obtained client-side via Google Sign-In, using the same `GOOGLE_CLIENT_ID`):

```json
{ "idToken": "<Google ID token>" }
```

The server verifies the token with Google, looks up the token's email against the `User` table, and issues a bearer JWT only if a matching row exists with `isEnabled: true` -- i.e. only emails an admin has already added can log in. Unregistered or disabled emails get a `403`; an invalid/unverifiable token gets a `401`.

Tokens can also still be generated manually for local development/testing (see `src/utils/jwt-utils.js`).

All `/api/v1/users` routes additionally require the caller to be an **enabled admin**: on every request, the JWT's `email` claim is looked up against the `User` table, and the request is rejected with `403` unless a matching row has `role: ADMIN` and `isEnabled: true`. Seed the first admin from the `ADMIN_USER` env var:

```bash
npm run db:seed
```

`ADMIN_PASS` is reserved for a future password-based flow and is not currently used anywhere — admin identity is entirely DB-driven via `ADMIN_USER`'s email.

## Project Tracking

- **Jira:** [BR project](https://ixawave.atlassian.net/jira/projects/BR) — backlog and active work
- **Confluence:** [BR space](https://ixawave.atlassian.net/wiki/spaces/BR/overview) — project docs

## License

ISC
