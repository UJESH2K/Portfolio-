import ContentEditor, { type Field } from "@/components/admin/ContentEditor";

const fields: Field[] = [
  { key: "caption", label: "Caption", type: "textarea" },
  { key: "image_url", label: "Photo", type: "image" },
  { key: "link_url", label: "Link (optional)" },
  { key: "link_label", label: "Link label (optional)" },
  { key: "sort_order", label: "Sort order (lower = first)", type: "number" },
];

export default function PostsAdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-lg font-medium">Updates</h1>
      <p className="mono mb-6 max-w-lg text-white/50">
        Like a LinkedIn post: a photo and a caption. These show up in the &quot;What I&apos;m up to&quot; section.
      </p>
      <ContentEditor table="posts" fields={fields} titleKey="caption" />
    </div>
  );
}
