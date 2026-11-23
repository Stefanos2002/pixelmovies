import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import siteLogo from "@/public/assets/images/logo.webp";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-black px-4 text-center">
      <Link href="/">
        <Image src={siteLogo} alt="Pixel Movies" width={200} height={67} className="h-auto w-[170px] sm:w-[200px]" />
      </Link>
      <h1 className="text-6xl font-black text-white">404</h1>
      <p className="max-w-md text-neutral-400">
        This page doesn&apos;t exist — it may have moved, or the game or movie
        isn&apos;t in our catalogue.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500">
          Back to home
        </Link>
        <Link href="/games/page/1" className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
          Browse games
        </Link>
        <Link href="/movies/moviepage/1" className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
          Browse movies
        </Link>
      </div>
    </div>
  );
}
