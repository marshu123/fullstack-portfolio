export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Endpoint = {
  id: string;
  url: string;
  description: string;
  secret: string;
  is_active: boolean;
  event_types: string[];
  created_at: string;
};

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export type EventSummary = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
  delivery_count: number;
  succeeded_count: number;
  pending_count: number;
  dead_count: number;
};

export type DeliveryStatus = 'pending' | 'delivering' | 'succeeded' | 'dead';

export type Delivery = {
  id: string;
  event_id: string;
  event_type: string;
  endpoint_id: string;
  endpoint_url: string;
  status: DeliveryStatus;
  attempts: number;
  max_attempts: number;
  next_attempt_at: string | null;
  last_attempt_at: string | null;
  response_status: number | null;
  error: string | null;
  duration_ms: number | null;
  created_at: string;
  completed_at: string | null;
};

export type Attempt = {
  id: string;
  attempt_number: number;
  outcome: 'success' | 'http_error' | 'timeout' | 'network_error';
  status_code: number | null;
  response_body: string | null;
  error: string | null;
  duration_ms: number;
  attempted_at: string;
};

export type DeliveryDetail = Delivery & {
  payload: Record<string, unknown>;
  attempt_log: Attempt[];
};

export type Stats = {
  endpoints: number;
  active_endpoints: number;
  events_24h: number;
  deliveries_24h: number;
  pending: number;
  dead: number;
  succeeded_24h: number;
  success_rate: number;
  p95_latency_ms: number | null;
};
