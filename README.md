 ## E-Commerce API

A full-featured e-commerce backend built with Node.js, Express, and PostgreSQL (via Prisma). Includes JWT authentication with refresh-token rotation, role-based authorization, product catalog with filtering/search/pagination, reviews, orders with race-safe stock handling, Stripe payments, an admin dashboard, Redis caching, and interactive Swagger API docs.

## 🌐 Live Demo & API Documentation

- **Live Base URL:** [https://ecommerce-api-2-blb5.onrender.com](https://ecommerce-api-2-blb5.onrender.com)
- **Interactive Swagger Docs:** [https://ecommerce-api-2-blb5.onrender.com/api/docs](https://ecommerce-api-2-blb5.onrender.com/api/docs)

> **Note:** The API is hosted on Render's free tier. If the server has been idle, the first request may take a few seconds to respond while the instance spins up.

## Features

- **Authentication & Authorization** — JWT access + refresh tokens with rotation, logout/revocation, change/forgot/reset password, role-based access control (`CUSTOMER` / `ADMIN`)
- **Products** — full CRUD, filtering by category/price, search, sorting, pagination, soft delete, image upload
- **Categories** — full CRUD, admin-only writes
- **Reviews** — one review per user per product, average rating, owner-only edit, owner/admin delete
- **Orders** — created atomically from a list of items; stock is decremented with a race-safe transaction so concurrent orders can never oversell; admin status management with automatic stock restoration on cancellation
- **Payments** — Stripe integration (PaymentIntents + signature-verified webhooks) that confirms orders automatically on successful payment
- **Admin Dashboard** — revenue, order/user counts, order status breakdown, low-stock alerts, user management
- **Caching** — Redis-backed caching on product/category reads, automatically invalidated on writes
- **Rate Limiting** — stricter limits on auth endpoints to slow down brute-force attempts
- **API Docs** — interactive Swagger UI, generated from inline JSDoc annotations
- **Validation & Error Handling** — Zod schemas on every input (body/params/query), centralized error handler, consistent JSON response shape

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js, Express |
| Database | PostgreSQL, Prisma ORM |
| Cache | Redis |
| Auth | JWT (`jsonwebtoken`), `bcrypt` |
| Validation | Zod |
| Payments | Stripe |
| File uploads | Multer |
| Docs | swagger-jsdoc, swagger-ui-express |
| Deployment | Render |
| Containerization | Docker, Docker Compose |

## Project Structure
src/
├── config/          # Database, Redis, Swagger configuration
├── controllers/     # Request handlers / business logic
├── middleware/      # auth, validation, caching, rate limiting, error handling
├── routes/          # Route definitions + OpenAPI annotations
├── utils/           # JWT, email, Stripe, Redis helpers
├── validations/     # Zod schemas
├── app.js           # Express app setup
└── server.js        # Entry point
prisma/
├── schema.prisma
└── migrations/
## Getting Started (Local Development)

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL and Redis) — or your own local instances
- A free [Stripe](https://dashboard.stripe.com/register) account (test mode) for payments
- [Stripe CLI](https://docs.stripe.com/stripe-cli) for local webhook testing

### Installation

```bash
git clone <repo-url>
cd ecommerce-api
npm install
Environment Variables
Copy .env.example to .env and fill in the values:
cp .env.example .env

Generate strong JWT secrets with:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
Run with Docker (PostgreSQL + Redis)
docker compose up -d
Database Setup
npx prisma migrate dev
Start the Server
npm run dev
The local API will be running at http://localhost:3000.
Stripe Webhooks (local development)
 In a separate terminal, forward Stripe events to your local server:
stripe login
stripe listen --events=payment_intent.succeeded,payment_intent.payment_failed --forward-to=localhost:3000/api/payments/webhook
Copy the whsec_... value it prints into STRIPE_WEBHOOK_SECRET in .env, then restart the server.
API Documentation
Interactive Swagger UI (try every endpoint directly from the browser):
Production: https://ecommerce-api-2-blb5.onrender.com/api/docs (https://www.google.com/url?sa=E&source=gmail&q=https://ecommerce-api-2-blb5.onrender.com/api/docs)
Local: http://localhost:3000/api/docs
A Postman collection is also included: Ecommerce-API-Auth.postman_collection.json.
Key Endpoints

Full details for every endpoint — request bodies, query parameters, and response shapes — are in the Swagger docs above.
Design Notes
Stock safety: order creation uses a single database transaction with a conditional update (stock >= quantity), so concurrent orders on the same product can never oversell.
Soft deletes: products are never hard-deleted (isActive: false instead), preserving order history integrity.
Password resets: tokens are single-use, short-lived (15 minutes), and stored as a hash — never in plain text.
Cache invalidation: any write to products, categories, or reviews clears the relevant Redis cache keys immediately, so reads are never stale.
Author
Ikhlas Alaswad
License
MIT