import { ResourceList } from '@/components/resource-list';

export default function PurchaseOrdersPage() {
  return (
    <ResourceList
      kind="purchase-orders"
      columns={[
        { key: 'po_number', label: 'PO number' },
        { key: 'location.client.name', label: 'Client' },
        { key: 'location.name', label: 'Location' },
        { key: 'order_date', label: 'Order date' },
        { key: 'total_amount', label: 'Total' },
        { key: 'status', label: 'Status' },
      ]}
      endpoint="purchase-orders"
      title="Purchase Orders"
    />
  );
}