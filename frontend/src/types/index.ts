export interface Tier {
  id: string;
  name: string;
  price: number;
  total_capacity: number;
  available_seats: number;
}

export interface Booking {
  id: string;
  tier_id: string;
  user_id: string;
  quantity: number;
  total_amount: number;
  created_at: string;
  tier_name?: string;
  unit_price?: number;
}
