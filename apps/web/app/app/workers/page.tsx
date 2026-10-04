import { ResourceList } from '@/components/resource-list';

export default function WorkersPage() {
  return (
    <ResourceList
      kind="workers"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'skill', label: 'Skill' },
        { key: 'status', label: 'Status' },
        { key: 'location.name', label: 'Current location' },
      ]}
      endpoint="workers"
      title="Workers"
    />
  );
}