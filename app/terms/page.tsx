import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, ContactLine } from "@/app/Components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The rules for using Pixel Movies and posting reviews.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="23 November 2026">
      <p>
        By using Pixel Movies (<strong>pixelmovies.gr</strong>) or creating an
        account you agree to these terms. If you do not agree, please do not use
        the site.
      </p>

      <h2>About the service</h2>
      <p>
        Pixel Movies is a free, non-commercial website created as an academic
        thesis project. It lets you browse movies, TV shows and video games,
        write reviews and keep personal lists. It is provided &quot;as is&quot;,
        without guarantees of availability or accuracy, and may change or be
        discontinued at any time.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You must be at least 15 years old to create an account.</li>
        <li>Keep your password secret; you are responsible for activity on your account.</li>
        <li>You can delete your account at any time from your account page.</li>
      </ul>

      <h2>Reviews and content you post</h2>
      <p>You keep ownership of your reviews. By posting them you allow us to display them on the site. You agree not to post content that:</p>
      <ul>
        <li>is illegal, hateful, harassing, threatening or sexually explicit;</li>
        <li>infringes someone else&apos;s copyright or other rights;</li>
        <li>is spam, advertising, or impersonates another person;</li>
        <li>contains personal data of other people.</li>
      </ul>
      <p>We may remove content or suspend accounts that break these rules.</p>

      <h2>Acceptable use</h2>
      <p>
        Do not attempt to disrupt the site, access other users&apos; accounts,
        scrape it at scale, or bypass its security or rate limits.
      </p>

      <h2>Third-party content and trademarks</h2>
      <p>
        Game information and images are provided by{" "}
        <a href="https://rawg.io" className="text-violet-400 hover:text-violet-300">RAWG</a>.
        Movie and TV information and images are provided by{" "}
        <a href="https://www.themoviedb.org" className="text-violet-400 hover:text-violet-300">TMDB</a>.
        This product uses the TMDB API but is not endorsed or certified by TMDB.
        All game, movie and TV titles, artwork and trademarks belong to their
        respective owners; Pixel Movies is not affiliated with any publisher,
        studio or platform holder.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent permitted by law, the project team is not liable for any
        loss arising from use of the site or from reliance on reviews, which
        reflect only the opinions of their authors.
      </p>

      <h2>Governing law and contact</h2>
      <p>
        These terms are governed by Greek law. Questions? Contact us at{" "}
        <ContactLine />. See also our{" "}
        <Link href="/privacy" className="text-violet-400 hover:text-violet-300">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
