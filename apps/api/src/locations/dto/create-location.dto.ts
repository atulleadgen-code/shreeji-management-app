export interface CreateLocationDto {
  client_id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  status?: string;
  created_by?: string | null;
}
