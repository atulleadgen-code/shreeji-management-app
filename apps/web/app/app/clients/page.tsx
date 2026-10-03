import { ResourceList } from '@/components/resource-list';

export default function ClientsPage() {
  return (
    <ResourceList
      kind="clients"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'status', label: 'Status' },
      ]}
      endpoint="clients"
      title="Clients"
    />
  );
}