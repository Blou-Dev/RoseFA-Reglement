export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function slugToHref(slug: string[]) {
  return slug.length === 0 ? "/" : `/docs/${slug.join("/")}`;
}
