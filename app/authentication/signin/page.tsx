"use client";
import { FormEvent, useEffect, useState, Suspense } from "react";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell, AuthInput, AuthSubmit } from "@/app/Components/AuthShell";

const PROVIDER_NAMES: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  credentials: "email & password",
};
const providerName = (provider?: string | null) =>
  PROVIDER_NAMES[provider || "credentials"] ?? "another sign-in method";

function Signin() {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const usedProvider = searchParams.get("provider");

  useEffect(() => {
    if (!error) return;
    const messages: Record<string, string> = {
      EmailInUse: `This email is already registered with ${providerName(usedProvider)}. Please sign in with ${providerName(usedProvider)} instead.`,
      NoEmail:
        "Your account didn't share an email address with us. Make your email public on the provider (e.g. GitHub) or sign up with email & password.",
      AccessDenied: "Access was denied. Please try again.",
      OAuthSignin: "Couldn't start the sign-in. Please try again.",
      OAuthCallback: "Sign in with the provider failed. Please try again.",
      Callback: "Sign in with the provider failed. Please try again.",
      OAuthAccountNotLinked:
        "This email is already linked to a different sign-in method.",
      SessionRequired: "Please sign in to continue.",
    };
    setErrorMessages([
      messages[error] ?? "Something went wrong while signing in. Please try again.",
    ]);
  }, [error, usedProvider]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessages([]);

    const formData = new FormData(event.target as HTMLFormElement);
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;

    setLoading(true);
    try {
      // Pre-check: friendlier messages than the generic credentials failure
      const response = await fetch(`/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.status === 404) {
        setErrorMessages(["Email or password is incorrect."]);
        return;
      }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setErrorMessages([
          body?.message || "Something went wrong. Please try again.",
        ]);
        return;
      }

      const { data } = await response.json();
      const provider = data?.provider || "credentials";
      if (provider !== "credentials") {
        setErrorMessages([
          `This email is registered with ${providerName(provider)}. Use the ${providerName(provider)} button above to sign in.`,
        ]);
        return;
      }
      if (!data?.isVerified) {
        setErrorMessages([
          "Please verify your email first — check your inbox. Didn't get it? Sign up again with the same email to receive a new link.",
        ]);
        return;
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/",
      });

      if (signInResult?.error) {
        setErrorMessages(["Email or password is incorrect."]);
      } else {
        router.push(signInResult?.url || "/");
        return; // keep the spinner while navigating
      }
    } catch (err) {
      console.error("Error during credentials' check:", err);
      setErrorMessages(["Couldn't reach the server. Check your connection."]);
    }
    setLoading(false);
  };

  return (
    <AuthShell
      image="/assets/images/moon-knight.webp"
      tagline="Pick up where you left off — your library and reviews are waiting."
      title="Welcome Back"
      subtitle="Sign in to your account"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <AuthInput
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          icon={<FiMail size={15} />}
          autoComplete="email"
        />
        <AuthInput
          id="password"
          type="password"
          label="Password"
          placeholder="Your password"
          icon={<FiLock size={15} />}
          autoComplete="current-password"
        />

        {errorMessages.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5">
            {errorMessages.map((message, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-xs text-red-400"
              >
                <FiAlertCircle className="mt-0.5 shrink-0" size={13} />
                <span>{message}</span>
              </div>
            ))}
          </div>
        )}

        <AuthSubmit
          loading={loading}
          label="Sign In"
          loadingLabel="Signing in..."
        />

        <p className="text-center text-sm text-white/40">
          Don&apos;t have an account?{" "}
          <Link
            href="/authentication/signup"
            className="text-violet-400 transition-colors duration-200 hover:text-violet-300"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function SigninFallBack() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Signin />
    </Suspense>
  );
}
