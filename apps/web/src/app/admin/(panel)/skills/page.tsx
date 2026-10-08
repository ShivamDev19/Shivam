'use client';
import ResourceManager from '@/components/admin/ResourceManager';

export default function Page() {
  return (
    <ResourceManager title="Skills" endpoint="/skills" titleKey="name" subKey="category" toggleKey="active" emptyText="No skills added yet." fields={[{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'category', label: 'Category', type: 'text', required: true }, { name: 'icon', label: 'Icon', type: 'text' }, { name: 'active', label: 'Active', type: 'checkbox' }]} />
  );
}
