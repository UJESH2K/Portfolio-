import ContentEditor, { type Field } from "@/components/admin/ContentEditor";

const fields: Field[] = [
  { key: "short", label: "Short label (e.g. 5×, ICPC)" },
  { key: "title", label: "Title" },
  { key: "detail", label: "Detail", type: "textarea" },
  { key: "year", label: "Year" },
  { key: "tier", label: "Tier", type: "select", options: ["gold", "silver", "bronze"] },
  { key: "href", label: "Link (optional)" },
  { key: "image_url", label: "Image", type: "image" },
  { key: "sort_order", label: "Sort order (lower = first)", type: "number" },
];

export default function AchievementsAdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-lg font-medium">Achievements</h1>
      <ContentEditor table="achievements" fields={fields} titleKey="title" subtitleKey="year" />
    </div>
  );
}
