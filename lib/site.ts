/** The site's real address, used for canonical links, the sitemap and
 *  structured data. Override with NEXT_PUBLIC_SITE_URL if the domain moves. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ujesh.in").replace(/\/$/, "");
