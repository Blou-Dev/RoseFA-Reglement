import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
        <div className="text-sm uppercase tracking-[0.24em] text-rose-300">404</div>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white">Page introuvable</h1>
        <p className="mt-4 text-sm leading-7 text-white/65">
          La page que tu cherches n&apos;existe pas encore, a ete deplacee ou attend son contenu definitif.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
