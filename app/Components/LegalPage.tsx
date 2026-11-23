import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import siteLogo from "@/public/assets/images/logo.webp";
import Footer from "./Footer";

// Contact address shown on the legal pages. Set NEXT_PUBLIC_CONTACT_EMAIL
// in .env.local and on Vercel (e.g. a dedicated project address).
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

export function ContactLine() {
  return CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`} className="text-violet-400 hover:text-violet-300">
      {CONTACT_EMAIL}
    </a>
  ) : (
    <>the contact address of the project team</>
  );
}

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-black text-neutral-300">
      <header className="border-b border-white/10 px-4 py-3">
        <Link href="/" className="inline-block">
          <Image src={siteLogo} alt="Pixel Movies" width={160} height={53} className="h-auto w-[140px] sm:w-[160px]" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="mt-1 text-sm text-neutral-500">Last updated: {updated}</p>
        <div className="legal mt-8 space-y-6 leading-7 [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-white">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
