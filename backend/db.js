const { Pool } = require('pg');

// Connectivity to the database tier is configured entirely through env vars.
// In docker-compose, DB_HOST is a service name (e.g. "database").
// In Kubernetes, DB_HOST is a Service name/DNS (e.g. "postgres-service")
// or a ClusterIP. Only the value of the env var changes between the two.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
