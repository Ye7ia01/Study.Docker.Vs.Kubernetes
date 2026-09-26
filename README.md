# 3-Tier Todo App — Docker & Kubernetes Practice

A minimal 3-tier app for practicing container deployment. Every cross-service
connection is driven by environment variables, so the **only thing that
changes between your Docker setup and your Kubernetes setup is the values of
those env vars** — not the application code.

```
 [ browser ]
      |
      v
 frontend (Node/Express, port 3000)
   - serves the static UI (public/)
   - proxies /api/* to BACKEND_URL
      |
      v
 backend (Node/Express, port 5000)
   - REST API for todos
   - connects to Postgres using DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME
      |
      v
 database (PostgreSQL)
   - table "todos", seeded by database/init.sql
```

## Layout

```
frontend/       static UI + Express server that proxies /api to the backend
backend/        Express REST API (GET/POST/PUT/DELETE /api/todos)
database/       init.sql — schema + seed data for Postgres
.env.example    every env var used for service connectivity, documented
```

## Env vars (the important part)

| Var            | Used by  | Purpose                                          | Docker example        | Kubernetes example              |
|-----------------|----------|---------------------------------------------------|------------------------|----------------------------------|
| `BACKEND_URL`   | frontend | address of the backend service                    | `http://backend:5000`  | `http://backend-service:5000`   |
| `DB_HOST`       | backend  | address of the database service                    | `database`              | `postgres-service`               |
| `DB_PORT`       | backend  | database port                                       | `5432`                  | `5432`                           |
| `DB_USER`       | backend  | database user                                       | `todo_user`             | (from Secret)                    |
| `DB_PASSWORD`   | backend  | database password                                   | `todo_pass`             | (from Secret)                    |
| `DB_NAME`       | backend  | database name                                       | `todo_db`               | (from Secret/ConfigMap)          |
| `PORT`          | both     | port each service listens on                        | `3000` / `5000`         | same                              |
| `POSTGRES_USER/PASSWORD/DB` | db image | standard Postgres image init vars      | matches `DB_USER` etc.  | matches `DB_USER` etc.           |

See `.env.example` for a ready-to-copy reference.

## API endpoints (backend)

- `GET /health` — checks the DB connection
- `GET /api/todos` — list todos
- `POST /api/todos` `{ "text": "..." }` — create
- `PUT /api/todos/:id` `{ "completed": true }` — toggle
- `DELETE /api/todos/:id` — delete

## Quick local sanity check (no containers)

Useful once, just to confirm the app itself works before you containerize it.

1. Start a Postgres instance any way you like and run `database/init.sql` against it.
2. `cd backend && npm install && npm start` — export the `DB_*` vars first (or use `.env`).
3. `cd frontend && npm install && npm start` — export `BACKEND_URL=http://localhost:5000` first.
4. Open `http://localhost:3000`.

## What's next (your practice)

This repo intentionally stops at the application code. To practice:

1. **Docker**: write a `Dockerfile` for `frontend/` and `backend/`, then a
   `docker-compose.yml` wiring all three services together on a shared
   network, using the env vars above (service names become `DB_HOST` /
   `BACKEND_URL`). Mount `database/init.sql` into the Postgres container's
   `/docker-entrypoint-initdb.d/`.
2. **Kubernetes**: translate the same setup into Deployments + Services
   (ClusterIP for backend/db, NodePort or Ingress for frontend), a
   ConfigMap/Secret for the DB credentials, and a PersistentVolumeClaim for
   Postgres data. Notice how `DB_HOST`/`BACKEND_URL` become Kubernetes
   Service DNS names instead of docker-compose service names — same app,
   same env var names, different plumbing underneath.

Good things to research while you build the k8s manifests: `ConfigMap` vs
`Secret`, `ClusterIP` vs `NodePort`, `Deployment` vs `StatefulSet` (for
Postgres), and `PersistentVolumeClaim`.
