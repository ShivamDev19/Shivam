'use client';
import ResourceManager from '@/components/admin/ResourceManager';

export default function Page() {
  return (
    <ResourceManager title="Social links" endpoint="/social-links" titleKey="platform" subKey="url" toggleKey="active" emptyText="No social links added yet." fields={[{ name: 'platform', label: 'Platform', type: 'text', required: true }, { name: 'url', label: 'URL', type: 'text', required: true }, { name: 'label', label: 'Label', type: 'text' }, { name: 'active', label: 'Active', type: 'checkbox' }]} />
  );
}
