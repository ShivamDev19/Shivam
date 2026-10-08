'use client';
import ResourceManager from '@/components/admin/ResourceManager';

export default function Page() {
  return (
    <ResourceManager title="Education" endpoint="/education" titleKey="degree" subKey="institution" emptyText="No education added yet." fields={[{ name: 'institution', label: 'Institution', type: 'text', required: true }, { name: 'degree', label: 'Degree', type: 'text', required: true }, { name: 'field', label: 'Field', type: 'text' }, { name: 'startDate', label: 'Start date', type: 'date' }, { name: 'endDate', label: 'End date', type: 'date' }, { name: 'grade', label: 'Grade / CGPA', type: 'text' }, { name: 'description', label: 'Description', type: 'textarea' }]} />
  );
}
