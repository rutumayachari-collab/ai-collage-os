# AICollegeOS — Backend (Phase 1: Foundation)

Production-ready backend foundation for **AICollegeOS**, an AI-powered College ERP.
This phase ships infrastructure only — no ERP business logic — but the architecture is
designed to absorb 100+ feature modules without touching the foundation.

The React + TypeScript frontend is a separate application; this service communicates with
it exclusively over versioned REST APIs.

---

## Tech stack

| Concern        | Choice                              |
| -------------- | ----------------------------------- |
| Runtime        | Node.js 20+ LTS                     |
| Framework      | Express 4                           |
| Language       | TypeScript (strict, no `any`)       |
| Database       | MongoDB Atlas + Mongoose 8          |
| Auth           | JWT + bcrypt                        |
| Validation     | Zod                                 |
| Security       | Helmet, CORS, Cookie Parser         |
| Logging        | Morgan + structured logger          |
| Uploads        | Multer (in-memory)                  |
| Email          | Nodemailer                          |
| Tooling        | Nodemon, ESLint, Prettier, npm      |

---

## Installation

```bash
cd backend
npm install
cp .env.example .env
```

## Environment setup

Fill in `.env` (validated with Zod at boot — the process exits on invalid config):

| Variable         | Required | Description                                        |
| ---------------- | -------- | -------------------------------------------------- |
| `PORT`           | no       | HTTP port (default `5000`)                          |
| `NODE_ENV`       | no       | `development` \| `test` \| `production`             |
| `MONGODB_URI`    | **yes**  | MongoDB Atlas connection string                     |
| `JWT_SECRET`     | **yes**  | ≥ 16 chars signing secret                           |
| `JWT_EXPIRES_IN` | no       | Token lifetime (default `7d`)                       |
| `EMAIL_HOST`     | no       | SMTP host                                           |
| `EMAIL_PORT`     | no       | SMTP port                                           |
| `EMAIL_USER`     | no       | SMTP username / from address                        |
| `EMAIL_PASS`     | no       | SMTP password                                       |
| `CLIENT_URL`     | no       | Allowed frontend origin(s), comma separated         |

## Running locally

```bash
npm run dev      # nodemon + ts-node, hot reload
npm run build    # type-check and emit dist/
npm start        # run the compiled build
npm run lint     # ESLint
npm run format   # Prettier
```

Verify the service:

```bash
curl http://localhost:5000/api/v1/health
```

```json
{
  "success": true,
  "message": "AICollegeOS Backend Running",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "environment": "development",
  "data": { "service": "AICollegeOS", "status": "ok", "environment": "development", "uptimeSeconds": 3 }
}
```

### Endpoints in this phase

| Method | Path                   | Purpose                              |
| ------ | ---------------------- | ------------------------------------ |
| GET    | `/`                    | Service banner                        |
| GET    | `/api/v1/health`       | Health check                          |
| GET    | `/api/v1/health/live`  | Liveness probe (K8s/uptime monitors)  |
| GET    | `/api/v1/health/ready` | Readiness probe incl. DB connectivity |

---

## Folder structure

```text
backend/
├── src/
│   ├── app.ts                     # Express composition (no side effects)
│   ├── server.ts                  # Bootstrap, graceful shutdown, process guards
│   ├── config/
│   │   ├── app.config.ts          # App, JWT, upload, mail configuration
│   │   ├── database.config.ts     # Mongoose connection options
│   │   ├── env.config.ts          # Zod-validated environment
│   │   └── index.ts
│   ├── database/
│   │   ├── connection.ts          # Connect/disconnect/health of MongoDB Atlas
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts     # authenticate + authorize(...roles)
│   │   ├── cors.middleware.ts
│   │   ├── error-handler.middleware.ts
│   │   ├── not-found.middleware.ts
│   │   ├── request-id.middleware.ts
│   │   ├── request-logger.middleware.ts
│   │   ├── security.middleware.ts
│   │   ├── validate-request.middleware.ts
│   │   └── index.ts
│   ├── routes/
│   │   ├── module.registry.ts     # Single list of mounted feature modules
│   │   ├── route-loader.ts        # Builds the /api/v1 router
│   │   └── index.ts
│   ├── shared/
│   │   ├── constants/             # HTTP status, error codes, roles
│   │   ├── repositories/          # BaseRepository<T> generic data access
│   │   ├── services/              # MailService, upload service
│   │   ├── types/                 # API, auth, module contracts
│   │   ├── utils/                 # ApiError, responses, asyncHandler, jwt, logger…
│   │   └── validators/            # Reusable Zod primitives
│   └── modules/
│       ├── health/                # Implemented (this phase)
│       ├── auth/                  # Model + repository + service foundation
│       ├── student/  faculty/  attendance/  fees/  admission/
│       ├── department/  parent/  placement/  library/  hostel/
│       └── transport/  exam/  notification/  chatbot/  analytics/
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── nodemon.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Architecture

Feature-based modular architecture with strict separation of concerns:

```text
route → middleware (validate/auth) → controller → service → repository → model
```

- **Controllers** are transport-only: parse, delegate, respond. No business rules.
- **Services** own business logic and are framework-agnostic (no Express types).
- **Repositories** extend `BaseRepository<T>` and encapsulate all Mongoose access.
- **Dependency injection** via constructor injection (`new HealthController(healthService)`),
  which keeps modules testable and swappable.
- **Errors**: throw `ApiError` subclasses anywhere; `asyncHandler` forwards rejections and the
  global error handler normalizes Zod, Mongoose, Mongo duplicate-key, and Multer errors into a
  single response envelope.
- **Responses**: every endpoint uses `sendSuccess` / the error envelope, so clients parse one shape.

### Adding a module in a future phase

1. `src/modules/<feature>/` → `*.model.ts`, `*.repository.ts`, `*.service.ts`,
   `*.controller.ts`, `*.routes.ts`, `*.validator.ts`.
2. Export a `FeatureModule` from `index.ts`:

   ```ts
   export const studentModule: FeatureModule = {
     name: 'Student',
     basePath: 'students',
     router: studentRoutes,
     enabled: true,
   };
   ```

3. Append it to `featureModules` in `src/routes/module.registry.ts`.

No foundation file changes are required — the loader mounts, prefixes, and logs it.

### Authentication foundation

`src/modules/auth` ships the domain layer (user model with role enum, repository,
`AuthService.register/login`, Zod validators) plus `authenticate` / `authorize(...roles)`
middleware and JWT/bcrypt utilities. HTTP routes are intentionally deferred to Phase 2.

---

## Development workflow

1. Branch from `main` (`feat/<module>`, `fix/<scope>`).
2. Implement inside a single module folder; put shared code in `src/shared`.
3. `npm run lint && npm run format && npm run build` must pass before review.
4. Keep files small and typed — `any` is an ESLint error.
5. Never commit `.env`; update `.env.example` when adding configuration.

## Operations

- Graceful shutdown on `SIGINT`/`SIGTERM` with a 10s force-exit guard.
- `unhandledRejection` and `uncaughtException` are logged and trigger shutdown.
- Every request carries an `x-request-id` correlation header (reused if supplied upstream).
- Structured JSON logs in production, human-readable in development.
- Point container/orchestrator probes at `/api/v1/health/live` and `/api/v1/health/ready`.
