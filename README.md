# EcoSphere AI

> Intelligent ESG Management Platform — Odoo Hackathon 2026

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key

### Backend Setup

```bash
cd ecosphere-backend
cp .env.example .env
# Edit .env with your DB credentials and OpenAI key

npm install

# Create and seed the database
psql -U postgres -c "CREATE DATABASE ecosphere_db;"
psql -U postgres -d ecosphere_db -f db/schema.sql
psql -U postgres -d ecosphere_db -f db/seed.sql

npm run dev
# Runs on http://localhost:5000
```

### Frontend Setup

```bash
cd ecosphere-frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Demo Login
| Email | Password | Role |
|---|---|---|
| admin@ecosphere.ai | password123 | Admin |
| sarah@ecosphere.ai | password123 | Sustainability Manager |
| amara@ecosphere.ai | password123 | Compliance Officer |

## Architecture

```
ecosphere-backend/           Node.js + Express + PostgreSQL
  db/schema.sql              19 tables
  db/seed.sql                Realistic demo data
  src/
    config/                  DB + OpenAI clients
    middleware/              Auth (JWT), RBAC, Validation, Error handling
    models/                  User model
    controllers/             8 controllers
    routes/                  8 route modules
    services/                ESG Score, AI Advisor, Simulator

ecosphere-frontend/          React + Vite + Tailwind CSS
  src/
    pages/                   9 pages (Login, Dashboard, E, S, G, Gamification, AI, Simulator, Reports)
    components/              UI + Layout + Charts
    services/                API layer (Axios)
    store/                   Zustand auth store
    routes/                  Protected routes
```

## ESG Score Formula
```
Overall = (Environmental × 0.40) + (Social × 0.30) + (Governance × 0.30)
```
Weights are configurable via the `esg_weights` table.
