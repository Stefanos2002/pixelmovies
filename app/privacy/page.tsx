import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, ContactLine } from "@/app/Components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Pixel Movies collects, uses and protects your personal data, and the cookies the site uses.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="23 November 2026">
      <p>
        Pixel Movies (<strong>pixelmovies.gr</strong>) is a non-commercial
        website developed as an academic thesis project. This policy explains
        what personal data we collect, why, and the rights you have under the EU
        General Data Protection Regulation (GDPR).
      </p>

      <h2>Who is responsible</h2>
      <p>
        The data controller is the Pixel Movies project team. For any privacy
        question or request, contact us at <ContactLine />.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> your email address, username and a
          securely hashed password (we never store your password in plain
          text). If you sign in with Google or GitHub, we receive your name,
          email address and profile picture from that provider.
        </li>
        <li>
          <strong>Content you create:</strong> reviews, ratings, your game
          library, your movie/TV watchlist and an optional profile picture.
        </li>
        <li>
          <strong>Technical data:</strong> your IP address is used briefly to
          protect sign-up and sign-in from abuse (rate limiting); these records
          are deleted automatically within an hour. Our hosting provider also
          keeps standard server logs.
        </li>
      </ul>
      <p>We do not use advertising, tracking or analytics cookies, and we never sell your data.</p>

      <h2>Why we use it (legal basis)</h2>
      <ul>
        <li>To create and run your account and show your reviews and lists — <em>performance of a contract</em> (Art. 6(1)(b) GDPR).</li>
        <li>To send the email that verifies your address — <em>performance of a contract</em>.</li>
        <li>To keep the service secure and prevent abuse — <em>legitimate interest</em> (Art. 6(1)(f) GDPR).</li>
      </ul>

      <h2>Who processes it for us</h2>
      <ul>
        <li><strong>Vercel</strong> — website hosting.</li>
        <li><strong>MongoDB Atlas</strong> — database where accounts and reviews are stored.</li>
        <li><strong>UploadThing</strong> — storage for profile pictures you upload.</li>
        <li><strong>Google (Gmail)</strong> — sending verification emails.</li>
        <li><strong>Google and GitHub</strong> — only if you choose to sign in with them.</li>
        <li>
          <strong>TMDB</strong> — when you rate a movie or TV show, the numeric
          rating is also submitted anonymously to TMDB (no personal data is sent).
        </li>
      </ul>
      <p>
        Some of these providers may process data outside the EU; they do so
        under the European Commission&apos;s Standard Contractual Clauses or
        equivalent safeguards.
      </p>

      <h2>Cookies</h2>
      <p>
        We only use cookies that are <strong>strictly necessary</strong> for the
        site to work, so no consent banner is required:
      </p>
      <ul>
        <li><code>next-auth.session-token</code> — keeps you signed in.</li>
        <li><code>next-auth.csrf-token</code> — protects forms against forged requests.</li>
        <li><code>next-auth.callback-url</code> — returns you to the right page after signing in.</li>
      </ul>
      <p>
        On secure connections these names carry a <code>__Secure-</code> or{" "}
        <code>__Host-</code> prefix.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your data for as long as your account exists. When you delete
        your account (Account → Account Details → Delete account), your profile,
        reviews, library and watchlist are permanently removed from our
        database. Unverified sign-up links expire after 24 hours.
      </p>

      <h2>Your rights</h2>
      <p>
        You can access, correct, export or delete your data, object to or
        restrict its processing, and withdraw consent at any time. Most of this
        you can do yourself from your account page; for anything else contact us
        at <ContactLine />. You also have the right to lodge a complaint with the
        Hellenic Data Protection Authority (
        <a href="https://www.dpa.gr" className="text-violet-400 hover:text-violet-300">www.dpa.gr</a>).
      </p>

      <h2>Children</h2>
      <p>The service is not directed at children under 15, and they should not create an account.</p>

      <h2>Changes</h2>
      <p>
        If we change this policy, we will update the date above. See also our{" "}
        <Link href="/terms" className="text-violet-400 hover:text-violet-300">Terms of Use</Link>.
      </p>
    </LegalPage>
  );
}
