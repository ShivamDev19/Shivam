'use client';
import ResourceManager from '@/components/admin/ResourceManager';

export default function Page() {
  return (
    <ResourceManager title="Certifications" endpoint="/certifications" titleKey="name" subKey="issuer" toggleKey="published" emptyText="No certifications added yet." fields={[{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'issuer', label: 'Issuer', type: 'text', required: true }, { name: 'issueDate', label: 'Issue date', type: 'date' }, { name: 'credentialId', label: 'Credential ID', type: 'text' }, { name: 'credentialUrl', label: 'Credential URL', type: 'text' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'published', label: 'Published', type: 'checkbox' }]} />
  );
}
