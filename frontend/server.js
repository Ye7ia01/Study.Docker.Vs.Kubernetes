require('dotenv').config();
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Connectivity to the backend tier is configured entirely through this env var.
// In docker-compose, BACKEND_URL = http://backend:5000 (service name).
// In Kubernetes, BACKEND_URL = http://backend-service:5000 (Service DNS name),
// or a ClusterIP/domain. Only the value changes between the two setups.
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

app.use(createProxyMiddleware({ target: BACKEND_URL, changeOrigin: true, pathFilter: '/api' }));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Frontend listening on port ${PORT}`);
  console.log(`Proxying /api requests to BACKEND_URL=${BACKEND_URL}`);
});
