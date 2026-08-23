/** Turns "Cardamom (Large)" into "cardamom-large" for use in crop/tool URLs. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
