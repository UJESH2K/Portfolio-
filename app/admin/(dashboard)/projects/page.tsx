import ContentEditor, { type Field } from "@/components/admin/ContentEditor";

const fields: Field[] = [
  { key: "title", label: "Title" },
  { key: "subtitle", label: "One-line pitch" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "category", label: "Category", type: "select", options: ["personal", "freelance"] },
  { key: "stack", label: "Stack (comma separated)", type: "tags" },
  { key: "year", label: "Year" },
  { key: "repo", label: "Repo URL" },
  { key: "live", label: "Live URL" },
  { key: "image_url", label: "Cover image", type: "image" },
  { key: "video_url", label: "Demo video URL (optional, e.g. /reel/name.mp4)" },
  { key: "featured", label: "Featured", type: "checkbox" },
  { key: "sort_order", label: "Sort order (lower = first)", type: "number" },
];

export default function ProjectsAdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-lg font-medium">Projects</h1>
      <ContentEditor table="projects" fields={fields} titleKey="title" subtitleKey="subtitle" />
    </div>
  );
}
