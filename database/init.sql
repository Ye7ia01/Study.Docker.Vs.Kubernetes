-- Run automatically by the official postgres image on first startup if
-- mounted into /docker-entrypoint-initdb.d/ (works the same in Docker and
-- in a Kubernetes Pod via a ConfigMap volume mount).

CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  text VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT false
);

INSERT INTO todos (text, completed) VALUES
  ('Learn Docker basics', true),
  ('Practice docker-compose networking', false),
  ('Deploy the same app on Kubernetes', false),
  ('Understand Services vs Deployments', false);
