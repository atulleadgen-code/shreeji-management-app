import { ResourceList } from '@/components/resource-list';

export default function LocationsPage() {
  return (
    <ResourceList
      kind="locations"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'client.name', label: 'Client' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'status', label: 'Status' },
      ]}
      endpoint="locations"
      title="Locations"
    />
  );
}