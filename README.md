# BerryListings

A REST API for managing real estate property listings, built for a real estate agent client under the "Berry" brand.

## Tech Stack

- **Runtime:** Node.js (ESM), Express
- **Database:** MySQL via Prisma ORM
- **Auth:** JWT (`jsonwebtoken`), bearer tokens
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
```

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

## API Documentation

Interactive Swagger UI is served at `/docs` once the server is running (e.g. `http://localhost:3000/docs`), with the raw OpenAPI spec at `/docs.json`.

## API Endpoints

| Method | Path                     | Auth required | Description            |
|--------|--------------------------|----------------|-------------------------|
| POST   | `/api/v1/properties`     | Yes            | Create a property       |
| GET    | `/api/v1/properties`     | No             | List properties         |
| GET    | `/api/v1/properties/:id`| No             | Get a property by id    |
| PUT    | `/api/v1/properties/:id`| Yes            | Update a property        |
| DELETE | `/api/v1/properties/:id`| Yes            | Delete a property        |
| POST   | `/api/v1/users`          | Yes            | Create a user            |
| GET    | `/api/v1/users`          | Yes            | List users                |
| GET    | `/api/v1/users/:id`      | Yes            | Get a user by id          |
| PUT    | `/api/v1/users/:id`      | Yes            | Update a user             |
| DELETE | `/api/v1/users/:id`      | Yes            | Delete a user              |

## Authentication

Protected routes expect a `Bearer` JWT, signed with `JWT_SECRET`, in the `Authorization` header. There is currently **no login endpoint** to issue tokens through the API itself — tokens must be generated manually (see `src/utils/jwt-utils.js`). Adding a proper login flow (Google OAuth) is tracked in the roadmap below.

## Project Tracking

- **Jira:** [BR project](https://ixawave.atlassian.net/jira/projects/BR) — backlog and active work
- **Confluence:** [BR space](https://ixawave.atlassian.net/wiki/spaces/BR/overview) — project docs

## License

ISC
