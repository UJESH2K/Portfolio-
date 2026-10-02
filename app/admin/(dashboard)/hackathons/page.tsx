import ContentEditor, { type Field } from "@/components/admin/ContentEditor";

const fields: Field[] = [
  { key: "event", label: "Event name" },
  { key: "project", label: "Project name" },
  { key: "placement", label: "Placement (e.g. Silver medal, Winner)" },
  { key: "year", label: "Year" },
  { key: "blurb", label: "Blurb", type: "textarea" },
  { key: "href", label: "Repo/details link" },
  { key: "live", label: "Live URL" },
  { key: "image_url", label: "Image", type: "image" },
  { key: "sort_order", label: "Sort order (lower = first)", type: "number" },
];

export default function HackathonsAdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-lg font-medium">Hackathons</h1>
      <ContentEditor table="hackathons" fields={fields} titleKey="project" subtitleKey="event" />
    </div>
  );
}
