# System Design — Concert Ticket Booking System

## Overview
A monorepo containing a REST API backend (Node.js + Fastify) and a React frontend for booking concert tickets.

## Concurrency Strategy
We use pessimistic locking (`SELECT ... FOR UPDATE`) to handle high-contention ticket sales. This prevents overselling by serializing transactions at the database row level.

## Idempotency
Clients generate a UUID for each booking request. The server caches responses in the `idempotency_keys` table to ensure exactly-once semantics.
