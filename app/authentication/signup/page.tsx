"use client";
import { FormEvent, useState } from "react";
import {
  FiUser,
  FiMail,
  FiLock,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import Link from "next/link";
import { AuthShell, AuthInput, AuthSubmit } from "@/app/Components/AuthShell";

export default function Signup() {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [incoming, setIncoming] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessages([]);

    const formData = new FormData(event.target as HTMLFormElement);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    let password = formData.get("password") as string;
    let passwordre = formData.get("passwordre") as string;

    const errors: string[] = [];

    const usernameRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W]{10,}$/;
    if (!usernameRegex.test(username)) {
      errors.push(
        "Username must be at least 10 characters, include one capital letter and one number.",
      );
    }

    const passwordRegex = /^(?=.*[A-Z])[A-Za-z\d\W]{10,}$/;
    if (!passwordRegex.test(password)) {
      errors.push(
        "Password must be at least 10 characters and include one capital letter.",
      );
    }

    if (password !== passwordre) {
      errors.push("Passwords do not match.");
    }

    if (errors.length > 0) {
      setErrorMessages(errors);
      setIncoming("");
      return;
    }

    const form = event.currentTarget;
    setIncoming("");
    setLoading(true);

    try {
      // Plain password over HTTPS — the server validates and hashes it
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessages(
          result?.errors?.length
            ? result.errors
            : [result?.message || "Something went wrong. Please try again."],
        );
      } else {
        setIncoming(
          result?.message ||
            "A verification message has been sent to your email.",
        );
        form.reset();
      }
    } catch (error) {
      console.error("Error during user addition:", error);
      setErrorMessages(["Couldn't reach the server. Check your connection."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      image="/assets/images/dishonored.webp"
      tagline="Rate, review and track every game and movie you love."
      title="Create Account"
      subtitle="Join the community"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <AuthInput
          id="username"
          label="Username"
          placeholder="10+ chars, 1 capital, 1 number"
          icon={<FiUser size={15} />}
          autoComplete="username"
        />
        <AuthInput
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          icon={<FiMail size={15} />}
          autoComplete="email"
        />
        {/* Passwords side by side from sm up to save height */}
        <div className="grid gap-3 sm:grid-cols-2">
          <AuthInput
            id="password"
            type="password"
            label="Password"
            placeholder="10+ chars, 1 capital"
            icon={<FiLock size={15} />}
            autoComplete="new-password"
          />
          <AuthInput
            id="passwordre"
            type="password"
            label="Confirm"
            placeholder="Repeat password"
            icon={<FiLock size={15} />}
            autoComplete="new-password"
          />
        </div>

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

        {incoming && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-400">
            <FiCheckCircle className="mt-0.5 shrink-0" size={13} />
            <span>{incoming}</span>
          </div>
        )}

        <AuthSubmit
          loading={loading}
          label="Create Account"
          loadingLabel="Creating account..."
        />

        <p className="text-center text-[11px] leading-4 text-white/35">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline hover:text-white/60">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-white/60">
            Privacy Policy
          </Link>
          .
        </p>

        <p className="text-center text-sm text-white/40">
          Already have an account?{" "}
          <Link
            href="/authentication/signin"
            className="text-violet-400 transition-colors duration-200 hover:text-violet-300"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
