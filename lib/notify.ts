import { Resend } from "resend";

type MeetingRequest = {
  name: string;
  email: string;
  company?: string | null;
  budget?: string | null;
  project_type?: string | null;
  preferred_date?: string | null;
  message: string;
};

/** Best-effort email notification. Never throws — a failed email must not
 * block the request from being saved. */
export async function notifyNewRequest(req: MeetingRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.NOTIFY_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to,
      subject: `New freelance/meeting request from ${req.name}`,
      text: [
        `Name: ${req.name}`,
        `Email: ${req.email}`,
        req.company ? `Company: ${req.company}` : null,
        req.project_type ? `Project type: ${req.project_type}` : null,
        req.budget ? `Budget: ${req.budget}` : null,
        req.preferred_date ? `Preferred date: ${req.preferred_date}` : null,
        "",
        req.message,
        "",
        "— view and reply in /admin/requests",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (err) {
    console.error("notifyNewRequest failed:", err);
  }
}
