# 3-Tier Todo App — Docker & Kubernetes Practice

## 1. Architecture

A minimal 3-tier todo app for practicing container deployment:

- **Frontend**: Node/Express serving a static UI and proxying `/api/*` to the backend.
- **Backend**: Node/Express REST API for todos.
- **Database**: PostgreSQL, seeded by `database/init.sql`.

Every cross-service connection is driven by environment variables, so the
**only thing that changes between the Docker setup and the Kubernetes setup is
the values of those env vars** — not the application code.

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

## 2. Docker deployment

Prerequisites: Docker, and a `.env` file in each of `database/`, `backend/`
and `frontend/` (they are git-ignored, and `docker/docker-compose.yaml`
reads them).

```
cd docker
docker compose up --build
```

`--build` rebuilds the frontend and backend images if the code changed.

Open the app at <http://localhost:3000>.

To stop it, run `docker compose down` (add `-v` to also delete the database volume).

## 3. Kubernetes deployment (kind)

Prerequisites: Docker, [kind](https://kind.sigs.k8s.io/) and `kubectl`.
Run the commands from the repo root.

1. Build the images. The manifests expect the tags `frontend:latest` and `backend:latest`:
   ```
   docker build -t frontend:latest ./frontend
   docker build -t backend:latest ./backend
   ```
2. Create the cluster (1 control-plane + 2 workers, named `docker-vs-kubernetes`):
   ```
   kind create cluster --config kubernetes/kind_cluster.yaml
   ```
3. Load the images into the cluster nodes. kind nodes can't see your local Docker images otherwise:
   ```
   kind load docker-image frontend:latest backend:latest --name docker-vs-kubernetes
   ```
4. Apply the manifests:
   ```
   kubectl apply -f kubernetes/
   ```
   `kind_cluster.yaml` lives in the same folder, so kubectl reports an error
   for that one file. It is not a Kubernetes resource and the error can be ignored.
5. Check that everything is running:
   ```
   kubectl get pods -o wide
   ```

Open the app at <http://localhost:30000> or <http://localhost:30001>. These
are the two worker nodes, each mapping its NodePort `30000` to a host port.

To remove the cluster, run `kind delete cluster --name docker-vs-kubernetes`.
