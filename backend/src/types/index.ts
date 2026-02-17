export interface Tier {
  id: string;
  name: string;
  price: number;
  total_capacity: number;
  available_seats: number;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: string;
  tier_id: string;
  user_id: string;
  quantity: number;
  total_amount: number;
  created_at: Date;
}

export interface BookingWithTier extends Booking {
  tier_name: string;
  unit_price: number;
}

export interface CreateBookingInput {
  tierId: string;
  userId: string;
  quantity: number;
  idempotencyKey: string;
}

export interface CreateBookingResult {
  booking: Booking;
  fromCache: boolean;
}
