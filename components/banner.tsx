import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

export function Banner({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image?: string;
}) {
  return (
    <section className="surface-panel relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10]">
      <div className="grid min-h-[220px] md:min-h-[300px] md:grid-cols-[minmax(0,0.88fr)_minmax(340px,1.12fr)]">
        <div className="relative z-10 flex items-end border-b border-white/10 p-5 md:border-r md:border-b-0 md:p-8">
          <div className="max-w-[480px]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-200/80">
              Documentation officielle
            </div>
            <h1 className="mt-3 max-w-2xl text-[2.65rem] font-black leading-[0.95] tracking-[-0.06em] text-white md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/68 md:text-base">{description}</p>
          </div>
        </div>

        <div className="relative min-h-[190px] md:min-h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b10] via-[#0b0b10]/82 to-transparent md:hidden" />
          <div className="absolute inset-y-0 left-0 z-[1] hidden w-32 bg-gradient-to-r from-[#0b0b10] via-[#0b0b10]/84 to-transparent md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/38 via-transparent to-rose-500/8" />
          <Image
            src={image ?? siteConfig.bannerImage}
            alt={title}
            width={1400}
            height={460}
            className="h-full w-full object-cover object-[72%_center] opacity-52"
            priority
          />
        </div>
      </div>
    </section>
  );
}
