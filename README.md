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
cp .env.example .env
```

Then fill in `.env` with real values:

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default `3000`) |
| `DATABASE_URL` | MySQL connection string, the only DB variable actually read by the app/Prisma |
| `DB_HOST`, `DB_PORT`, `DB_SCHEMA`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Informational only -- building blocks for `DATABASE_URL` if you construct it by hand. **Not** auto-substituted into it (dotenv doesn't expand `${VAR}` references) |
| `ADMIN_USER` | Email seeded as the first admin `User` row via `npm run db:seed` |
| `ADMIN_PASS` | Currently unused -- there's no password-based auth in this app |
| `JWT_SECRET` | Signs/verifies bearer JWTs. Use a long, random value outside local dev |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from a Google Cloud project (APIs & Services > Credentials). Verifies Google ID tokens on login |

Never commit `.env` -- it's gitignored. `.env.example` holds names only, no real values.

Run migrations, seed the first admin, and start the server:

```bash
npx prisma migrate dev
npm run db:seed   # creates/updates the admin User row from ADMIN_USER
npm run dev       # nodemon, for local development
npm start         # plain node, for production
```

The server listens on `PORT` (default `3000`).

### Production Docker Image

```bash
docker build -t berrylistings .
docker run -p 3000:3000 --env-file .env berrylistings
```

### Local Development (Docker Compose)

For local development, `docker-compose.yml` + `Dockerfile.dev` run the app alongside its own MySQL container -- no local Node.js or MySQL install needed:

```bash
docker compose up --build
```

This applies pending Prisma migrations, generates the client, and starts the app with `nodemon --legacy-watch` (polling-based watch, needed for reliable file-change detection over Docker's bind mount). The app's `DATABASE_URL` is set directly in `docker-compose.yml` to point at the `db` service, independent of whatever `DATABASE_URL` is in your `.env`.

Common commands once it's running:

```bash
docker compose exec app npm run db:seed   # seed the first admin
docker compose exec app npm test          # run the test suite
docker compose logs app -f                # tail app logs
```

## Testing

```bash
npm test   # runs the vitest suite (unit + supertest integration tests)
```

The integration tests exercise the real routes/controllers against a live database, so run them with a database available -- e.g. `docker compose exec app npm test` using the Docker Compose dev stack above.

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

All `/api/v1/users` routes additionally require the caller to be an **enabled admin**: on every request, the JWT's `email` claim is looked up against the `User` table, and the request is rejected with `403` unless a matching row has `role: ADMIN` and `isEnabled: true`. See the `ADMIN_USER` row in the Setup env var table above for seeding the first admin.

## Project Tracking

- **Jira:** [BR project](https://ixawave.atlassian.net/jira/projects/BR) — backlog and active work
- **Confluence:** [BR space](https://ixawave.atlassian.net/wiki/spaces/BR/overview) — project docs

## License

ISC
