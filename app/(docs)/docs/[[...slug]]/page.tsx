import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Banner } from "@/components/banner";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { SearchHighlight } from "@/components/search-highlight";
import { getPublicPageBySlug } from "@/lib/docs";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolved = await params;
  const slug = resolved.slug ?? [];
  const page = await getPublicPageBySlug(slug);

  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function DocPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const resolved = await params;
  await searchParams;
  const slug = resolved.slug ?? [];
  const page = await getPublicPageBySlug(slug);

  if (!page) notFound();

  const { content } = await compileMDX({
    source: page.body,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return (
    <div className="space-y-8">
      <Banner title={page.title} description={page.description} image={page.banner ?? undefined} />
      <article className="content-prose rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-200">
            {page.category.title}
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-white/40">
            Mis a jour: {new Intl.DateTimeFormat("fr-FR").format(page.updatedAt)}
          </span>
        </div>
        <SearchHighlight>{content}</SearchHighlight>
      </article>
    </div>
  );
}
