# Concert Ticket Booking System

A robust, high-performance concert ticket booking system built with Node.js, Fastify, Postgres, and React.

## Features

- **Pessimistic Locking**: Ensures zero overselling even under high concurrency by locking tier rows during transactions.
- **Idempotency**: Prevents duplicate bookings on retries using client-side generated idempotency keys.
- **Transactional Integrity**: All booking operations are atomic.
- **Modern Tech Stack**: Fastify (Backend), React + TanStack Query + Zustand (Frontend).
- **Premium UI**: Sleek, dark-mode design with responsive elements.

## Architecture & Design Decisions

### Backend
- **Framework**: Fastify was chosen for its performance and low overhead.
- **Locking Strategy**: Used `SELECT ... FOR UPDATE` (Pessimistic Locking) instead of Optimistic Locking. In ticket sales, contention is extremely high when a popular event goes live. Optimistic locking would lead to many transaction retries, degrading user experience and increasing DB load.
- **Idempotency**: Implemented at the DB level with a unique constraint on `idempotency_key`, checked within the transaction.
- **Validation**: Zod is used for strict schema validation.

### Frontend
- **State Management**: Zustand handles the persistent mock user session. TanStack Query manages server state and caching.
- **Styling**: Vanilla CSS with a focus on rich aesthetics, gradients, and micro-interactions.

## Scaling Strategies

1. **Read/Write Splitting**: Use follower replicas for `GET /api/tiers` while keeping the master for transactional booking writes.
2. **Caching**: Cache tier availability in Redis with TTL. Use a "buffer" approach where you pre-reserve blocks of tickets in Redis to reduce DB contention.
3. **Queueing**: For extreme spikes, move booking requests to a message queue (e.g., RabbitMQ, SQS) and process them asynchronously, notifying the user via WebSockets.

## Setup & Running

### Prerequisites
- Docker & Docker Compose
- Node.js v18+

### Steps
1. **Database**: Run `docker-compose up -d` to start Postgres.
2. **Backend**:
   ```bash
   cd backend
   npm install
   npm run db:init # Initialize schema and seed data
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Running Tests
- **Backend**: `cd backend && npm test`
- **Frontend**: `cd frontend && npm test`
