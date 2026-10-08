'use client';
import ResourceManager from '@/components/admin/ResourceManager';

export default function Page() {
  return (
    <ResourceManager title="Experience" endpoint="/experience" titleKey="role" subKey="organization" toggleKey="published" emptyText="No experience entries yet." fields={[{ name: 'organization', label: 'Organization', type: 'text', required: true }, { name: 'role', label: 'Role', type: 'text', required: true }, { name: 'type', label: 'Type (e.g. Internship)', type: 'text', required: true }, { name: 'location', label: 'Location', type: 'text' }, { name: 'startDate', label: 'Start date', type: 'date' }, { name: 'endDate', label: 'End date', type: 'date' }, { name: 'current', label: 'Current', type: 'checkbox' }, { name: 'description', label: 'Description', type: 'textarea', required: true }, { name: 'technologies', label: 'Technologies', type: 'tags' }, { name: 'published', label: 'Published', type: 'checkbox' }]} />
  );
}
