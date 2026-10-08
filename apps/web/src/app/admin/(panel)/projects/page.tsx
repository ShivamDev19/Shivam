'use client';
import ResourceManager, { Field } from '@/components/admin/ResourceManager';

const fields: Field[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'slug', label: 'Slug (lowercase-kebab-case)', type: 'text', required: true },
  { name: 'shortDescription', label: 'Short description', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'category', label: 'Category', type: 'select', required: true, options: ['Full Stack', 'AI', 'Frontend', 'Automation'] },
  { name: 'projectType', label: 'Project type', type: 'select', required: true, options: ['Project', 'Internship Project', 'Assignment', 'Personal Project'] },
  { name: 'problem', label: 'Problem', type: 'textarea' }, { name: 'solution', label: 'Solution', type: 'textarea' },
  { name: 'features', label: 'Features', type: 'tags' }, { name: 'technologies', label: 'Technologies', type: 'tags' },
  { name: 'githubUrl', label: 'GitHub URL', type: 'text' }, { name: 'liveUrl', label: 'Live URL', type: 'text' },
  { name: 'heroImage', label: 'Hero image URL', type: 'text' }, { name: 'gallery', label: 'Gallery image URLs', type: 'tags' },
  { name: 'architecture', label: 'Architecture', type: 'textarea' }, { name: 'challenges', label: 'Challenges', type: 'textarea' }, { name: 'learnings', label: 'Learnings', type: 'textarea' },
  { name: 'featured', label: 'Featured', type: 'checkbox' }, { name: 'published', label: 'Published', type: 'checkbox' },
];
export default function Page() {
  return <ResourceManager title="Projects" endpoint="/projects" listQuery="?limit=50" fields={fields} titleKey="title" subKey="projectType" toggleKey="published" emptyText="No projects yet." />;
}
