import { pool } from '../../db/pool';
import { withTransaction } from '../../db/transaction';
import {
  TierNotFoundError,
  InsufficientInventoryError,
  PaymentFailedError,
} from '../../middleware/errorHandler';
import { Booking, BookingWithTier, CreateBookingInput, CreateBookingResult } from '../../types';
import {
  findCachedIdempotencyResponse,
  insertBooking,
  cacheIdempotencyKey,
  fetchBookingsForUser,
} from './bookings.queries';
import {
  fetchTierByIdForUpdate,
  decrementAvailableSeats,
} from '../tiers/tiers.queries';

function simulatePayment(): void {
  // 10% failure rate as specified in requirements
  if (Math.random() < 0.1) {
    throw new PaymentFailedError();
  }
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  return withTransaction(async (client) => {
    // 1. Idempotency check
    const cached = await findCachedIdempotencyResponse(client, input.idempotencyKey);
    if (cached) {
      return { booking: cached, fromCache: true };
    }

    // 2. Pessimistic lock on the tier row
    const tier = await fetchTierByIdForUpdate(client, input.tierId);
    if (!tier) {
      throw new TierNotFoundError();
    }

    // 3. Availability check
    if (tier.available_seats < input.quantity) {
      throw new InsufficientInventoryError();
    }

    // 4. Payment simulation inside transaction
    simulatePayment();

    // 5. Decrement seats
    await decrementAvailableSeats(client, input.tierId, input.quantity);

    // 6. Create booking record
    const totalAmount = tier.price * input.quantity;
    const booking = await insertBooking(
      client,
      input.tierId,
      input.userId,
      input.quantity,
      totalAmount,
    );

    // 7. Store idempotency key
    await cacheIdempotencyKey(client, input.idempotencyKey, booking);

    return { booking, fromCache: false };
  });
}

export async function getUserBookings(userId: string): Promise<BookingWithTier[]> {
  return fetchBookingsForUser(pool, userId);
}
