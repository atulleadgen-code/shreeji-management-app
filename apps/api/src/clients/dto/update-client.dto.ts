export interface UpdateClientDto {
  name?: string;
  email?: string | null;
  phone?: string | null;
  status?: string;
  created_by?: string | null;
}
