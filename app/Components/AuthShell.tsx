"use client";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

// Split layout: artwork on the left (lg+), compact form on the right.
// Sized to fit one viewport so the form never needs scrolling.
export function AuthShell({
  image,
  tagline,
  title,
  subtitle,
  children,
}: {
  image: string;
  tagline: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh w-full bg-black lg:grid-cols-2">
      {/* Artwork panel — desktop only */}
      <aside
        className="relative hidden bg-cover bg-center lg:block"
        style={{ backgroundImage: `url('${image}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80" />
        <p className="absolute bottom-10 left-10 max-w-sm text-3xl font-bold leading-tight text-white">
          {tagline}
        </p>
      </aside>

      {/* Form panel — on mobile the artwork sits blurred behind it */}
      <main
        className="relative flex items-center justify-center bg-cover bg-center px-4 py-6 lg:!bg-none"
        style={{ backgroundImage: `url('${image}')` }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm lg:bg-black lg:backdrop-blur-none" />

        <div className="relative w-full max-w-md">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors duration-200 hover:text-white/70"
          >
            <FiArrowLeft size={13} />
            Back to home
          </Link>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="mb-5 mt-0.5 text-sm text-white/50">{subtitle}</p>

          <SocialButtons />
          {children}
        </div>
      </main>
    </div>
  );
}

function SocialButtons() {
  const btn =
    "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition-all duration-200 hover:border-white/25 hover:bg-white/15";
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className={btn}
        >
          <FaGithub size={16} />
          GitHub
        </button>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className={btn}
        >
          <FaGoogle size={16} />
          Google
        </button>
      </div>
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-widest text-white/30">
          or
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
    </>
  );
}

// Labelled input with a leading icon; password inputs get a show/hide toggle
export function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  icon,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  icon: ReactNode;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[11px] font-medium uppercase tracking-wider text-white/60"
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
          {icon}
        </span>
        <input
          id={id}
          name={id}
          type={isPassword && visible ? "text" : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={`w-full rounded-xl border border-white/15 bg-white/10 py-2.5 pl-10 text-sm text-white transition-all duration-200 placeholder:text-white/30 focus:border-violet-500/70 focus:outline-none ${
            isPassword ? "pr-10" : "pr-4"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-white/30 transition-colors hover:text-white/60"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthSubmit({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-1 w-full cursor-pointer rounded-xl bg-violet-600 py-3 text-sm font-semibold tracking-wide text-white shadow-lg shadow-violet-900/30 transition-all duration-200 hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-violet-600/40"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-4 w-4 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
