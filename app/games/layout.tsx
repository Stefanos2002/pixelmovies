import type { Metadata } from "next";
import { Manrope } from "next/font/google";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Browse video games on Pixel Movies — the newest releases first, filtered by platform and genre, with ratings, details and user reviews.",
};

const manrope = Manrope({ subsets: ["latin"] });

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={manrope.className}>{children}</div>;
}
