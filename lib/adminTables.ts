export const ADMIN_TABLES = [
  "projects",
  "timeline_entries",
  "achievements",
  "hackathons",
  "posts",
] as const;

export type AdminTable = (typeof ADMIN_TABLES)[number];

export function isAdminTable(value: string): value is AdminTable {
  return (ADMIN_TABLES as readonly string[]).includes(value);
}
