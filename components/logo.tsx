import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 pr-2 transition hover:opacity-95">
      <span className="relative h-10 w-10 overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
        <Image src="/images/rosefa-icon.png" alt="RoseFA" fill className="object-contain p-1.5" />
      </span>
      <span className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-[0.45em] text-white/58">RoseFA</span>
        <span className="text-[1.55rem] font-black leading-none tracking-[-0.04em] text-white">Documentation</span>
      </span>
    </Link>
  );
}
