import { siteConfig } from "@/lib/site-config";

export function FooterBadge() {
  return (
    <div className="border-t border-white/10 px-1 py-5 text-sm text-white/52">
      {siteConfig.footerLabel}
    </div>
  );
}
