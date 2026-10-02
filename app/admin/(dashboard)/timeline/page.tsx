import ContentEditor, { type Field } from "@/components/admin/ContentEditor";

const fields: Field[] = [
  { key: "year", label: "Year" },
  { key: "title", label: "Title" },
  { key: "detail", label: "Detail", type: "textarea" },
  { key: "tag", label: "Type", type: "select", options: ["code", "win", "work", "life"] },
  { key: "image_url", label: "Image", type: "image" },
  { key: "sort_order", label: "Sort order (lower = first)", type: "number" },
];

export default function TimelineAdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-lg font-medium">Career timeline</h1>
      <ContentEditor table="timeline_entries" fields={fields} titleKey="title" subtitleKey="year" />
    </div>
  );
}
