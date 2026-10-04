export interface UpdatePurchaseOrderDto {
  location_id?: string;
  po_number?: string;
  order_date?: Date | string;
  total_amount?: number | string | null;
  status?: string;
  notes?: string | null;
  documentUrl?: string | null;
  created_by?: string | null;
}
