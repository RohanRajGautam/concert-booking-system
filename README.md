# Concert Ticket Booking System

A full-stack concert ticket booking system with pessimistic locking, idempotent requests, and JWT-based authentication. Built with **Fastify**, **PostgreSQL**, **React**, and **TypeScript**.

---

## Prerequisites

| Tool              | Version |
|-------------------|---------|
| Docker & Compose  | Any recent |
| Node.js           | ≥ 18    |
| npm               | ≥ 9     |

## Local Setup

```bash
# 1. Start the Postgres container
docker-compose up -d

# 2. Install & start the backend (runs migrations automatically)
cd backend
cp .env.example .env          # adjust if needed
npm install
npm run dev                   # → http://localhost:3000

# 3. In a second terminal — install & start the frontend
cd frontend
npm install
npm run dev                   # → http://localhost:5173
```

The backend runs migrations on startup, creating the `tiers`, `bookings`, `idempotency_keys`, and `users` tables and seeding three ticket tiers (VIP, Front Row, General Admission).

---

## Usage Walkthrough

### 1. Register a Test User

Open the app in a browser. You'll be redirected to `/login`. Click **Create one** to navigate to `/register`, then fill in a username, email, and password (min 6 chars).

```
POST /api/auth/register
{ "username": "rohan", "email": "rohan@rrg.com.np", "password": "secret123" }
```

### 2. Log In

If you already have an account, sign in at `/login`.

```
POST /api/auth/login
{ "email": "rohan@rrg.com.np", "password": "secret123" }
```

Both endpoints return `{ user, token }`. The frontend stores the JWT in `localStorage` and attaches it as `Authorization: Bearer <token>` on every API request.

### 3. Book Tickets

Select a tier → choose a quantity → click **Confirm & Pay**. The booking is created atomically and the seat count updates in real time.

### 4. Test Double-Booking Across Accounts

Open two browser windows (or use incognito). Register two different users. Both attempt to book the last remaining seat for the same tier simultaneously. One will succeed; the other will receive a `409 INSUFFICIENT_INVENTORY` error. See the section below for details on how this works.

---

## Running Tests

### Backend (Jest + Supertest)

```bash
cd backend
npm test
```

Tests cover tier listing, booking creation with JWT auth, 401 rejection without tokens, and concurrent booking safety.

### Frontend (Vitest + React Testing Library)

```bash
cd frontend
npx vitest run
```

Tests cover component rendering, booking form submission, error display, and booking history rendering — all with mocked auth state.

---

## Design Decisions & Trade-offs

### Authentication

**Approach**: Stateless JWT with `bcrypt` for password hashing.

- No sessions table — the token is self-contained and verified on each request. This keeps the backend horizontally scalable without shared session state.
- Token lifetime is 24 hours. No refresh token flow — this is a mocked auth system for testing purposes.
- Passwords are hashed with bcrypt (10 salt rounds), which is intentionally slow to resist brute-force attacks.

### Locking Strategy

**Approach**: Pessimistic locking via PostgreSQL's `SELECT ... FOR UPDATE`.

- Ticket sales generate extremely high write contention on a small number of rows. Optimistic locking (version columns) would cause cascading retries under load, wasting DB connections and degrading UX.
- Pessimistic locking is more predictable: concurrent requests queue at the database level and each gets an authoritative answer.

### Query Layer

**Approach**: Raw SQL via the `pg` driver, no ORM.

- Keeps the query layer transparent — every SQL statement is visible and auditable.
- Avoids ORM abstraction leaks, especially around `FOR UPDATE` and transaction boundaries.
- Trade-off: no migration auto-generation or model syncing. Migrations are hand-written SQL files.

### Framework Choices

| Layer    | Choice           | Rationale |
|----------|-----------------|-----------|
| Backend  | Fastify         | Fastest Node.js HTTP framework. Plugin-based, good TypeScript support. |
| Frontend | React + Vite    | Fast dev server, modern bundling, wide ecosystem. |
| State    | Zustand          | Minimal boilerplate, works well with React Query for server state. |
| Queries  | TanStack Query   | Automatic caching, refetching, and loading states. |
| Validation | Zod            | Runtime type validation with TypeScript inference. |

### Caching

- **Client-side**: TanStack Query caches tier data for 10 seconds (`staleTime`) and auto-refreshes every 30 seconds. This prevents hammering the backend while keeping seat counts reasonably fresh.
- **Server-side**: No Redis layer. For production, you'd cache tier availability in Redis with TTL and use a write-through strategy on booking.

### Idempotency

- The client generates a unique `idempotencyKey` (UUID) per booking request.
- The key is checked and stored *inside* the same database transaction as the booking.
- If a retry hits with the same key, the cached response is returned without decrementing seats again.
- This protects against network-level duplicates (e.g., user double-clicks, timeout retries) but is *not* the mechanism that prevents the race condition — that's the row lock.

---

## Global User Base Support

The system is designed to support a distributed, global user base with the following provisions:

### 1. Timezone Handling
- **Backend (UTC)**: All timestamps are stored in PostgreSQL using the `TIMESTAMPTZ` type. This ensures that time is recorded in UTC, irrespective of the server's local time.
- **Client (Local)**: The frontend uses standard JavaScript `Date` objects and `.toLocaleDateString()` / `.toLocaleTimeString()` to render timestamps. This automatically formats time according to the user's system locale and timezone settings.

### 2. Multi-Region Ready
- **Stateless Auth**: By using JWTs instead of server-side sessions, the API can be scaled horizontally across multiple geographical regions (e.g., through a Global Load Balancer) without requiring session synchronization (Sticky Sessions).
- **Database Scaling**: While currently using a single Postgres instance, the architecture is compatible with distributed SQL databases (like CockroachDB or YugabyteDB) or read-replicas in different regions.

### 3. Currency & Localization
- **Single Currency**: As per requirements, the system currently supports a single primary currency (USD).
- **Formatting**: The frontend uses the `Intl.NumberFormat` API to ensure currency values are formatted correctly according to international standards (e.g., `$1,200.00`).
- **i18n Provision**: The UI structure is modular, allowing for the easy integration of internationalization frameworks (like `react-i18next`) in the future.

---

## Non-Functional Requirements & Design for Scale

### 1. High Availability (99.99% "Four Nines")
To achieve 99.99% availability (max ~52 minutes of downtime per year), the current design would be extended as follows:
- **Multi-Region Deployment**: Deploy the Fastify application across multiple AWS regions (e.g., us-east-1 and eu-west-1) behind a **Route53 Global Accelerator** or Cloudflare Load Balancer.
- **Database Resilience**: Transition from a single Postgres instance to a **Managed Cluster (e.g., AWS Aurora)** with cross-region replicas and automated failover.
- **Statelessness**: Since the auth system is JWT-based, application nodes can be terminated and replaced instantly without losing user sessions.

### 2. Scale & Concurrency (1M DAU / 50k Peak)
The architecture supports scaling to 50k concurrent users through:
- **Horizontal Scaling**: Fastify's low overhead allows running hundreds of small containers in an **ECS/EKS cluster**. Auto-scaling triggers based on CPU/Request count would handle peak traffic during ticket drops.
- **Connection Pooling**: Use **PgBouncer** to manage the thousands of database connections that 50k concurrent users would generate, preventing the Postgres connection limit from being hit.
- **Load Balancing**: Distribute traffic across application nodes. For static assets, use a **CDN (CloudFront/Akamai)** to offload traffic from the application server.

### 3. Performance (p95 < 500ms)
To maintain a p95 latency under 500ms for booking requests:
- **Pessimistic Locking Efficiency**: By locking only the specific `tier` row, we minimize the "blast radius" of the lock. Unrelated bookings (e.g., for different concerts or tiers) proceed in parallel.
- **Optimized SQL**: Using raw SQL and a light framework (Fastify) ensures that the overhead between the request hitting the server and the query hitting the DB is minimal (often < 10ms).
- **Read/Write Splitting**: Direct `GET /api/tiers` requests to read-replicas while reserving the primary instance for `POST /api/bookings` transactions.
- **Caching**: Implement a **Redis** layer to cache tier metadata and availability (with a short TTL), reducing the read load on the primary DB during peak traffic.

---

## How Double-Booking Is Prevented

### The Problem

Two users simultaneously hit `POST /api/bookings` for the same tier when only 1 seat remains. Without synchronisation, both would:

1. Read `available_seats = 1`
2. Pass the availability check
3. Decrement to `available_seats = -1`
4. Both get a booking — **the event is oversold**.

### The Solution: `SELECT ... FOR UPDATE`

The booking flow in [`bookings.service.ts`](backend/src/features/bookings/bookings.service.ts) wraps the entire operation in a database transaction:

```
BEGIN
  1. Check idempotency key      — return cached response if duplicate
  2. SELECT * FROM tiers         — **FOR UPDATE** (acquires row-level lock)
     WHERE id = $1
  3. Check available_seats ≥ quantity
  4. Simulate payment
  5. UPDATE tiers SET available_seats = available_seats - quantity
  6. INSERT INTO bookings
  7. INSERT INTO idempotency_keys
COMMIT
```

**Step 2 is the critical part.** `FOR UPDATE` tells PostgreSQL to acquire an exclusive row-level lock on the tier row. If a second transaction tries to `SELECT ... FOR UPDATE` the same row, it **blocks** — it literally waits until the first transaction either commits or rolls back.

### What Happens Concurrently

| Time | Transaction A | Transaction B |
|------|--------------|--------------|
| T1   | `BEGIN` | `BEGIN` |
| T2   | `SELECT ... FOR UPDATE` → acquires lock, reads `seats = 1` | `SELECT ... FOR UPDATE` → **blocked, waiting** |
| T3   | Passes check, decrements to 0, inserts booking | (still waiting) |
| T4   | `COMMIT` → lock released | Lock acquired, re-reads `seats = 0` |
| T5   | | Fails availability check → `409 INSUFFICIENT_INVENTORY` |
| T6   | | `ROLLBACK` |

There is never a window where both transactions see stale data. The lock serialises access to the row.

### Where This Lives in Code

- **Row lock**: [`tiers.queries.ts → fetchTierByIdForUpdate()`](backend/src/features/tiers/tiers.queries.ts) — the `FOR UPDATE` query
- **Transaction wrapper**: [`db/transaction.ts → withTransaction()`](backend/src/db/transaction.ts) — `BEGIN` / `COMMIT` / `ROLLBACK`
- **Orchestration**: [`bookings.service.ts → createBooking()`](backend/src/features/bookings/bookings.service.ts) — the full booking flow with detailed inline comments
