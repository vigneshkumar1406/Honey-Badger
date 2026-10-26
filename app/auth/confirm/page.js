"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthConfirmPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Confirming your email and signing you in…");

  useEffect(() => {
    let active = true;
    async function finishConfirmation() {
      try {
        const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const expires_in = params.get("expires_in");

        if (!access_token || !refresh_token) {
          const query = new URLSearchParams(window.location.search);
          const error = query.get("error_description") || query.get("error");
          throw new Error(error || "This confirmation link is invalid or expired. Please request a new email or log in.");
        }

        const response = await fetch("/api/auth/confirm-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token, refresh_token, expires_in })
        });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Could not create your login session.");

        // Remove tokens from the address bar before navigating to the account.
        window.history.replaceState({}, document.title, "/auth/confirm");
        router.replace("/account");
        router.refresh();
      } catch (error) {
        if (active) setMessage(error.message || "Email confirmed, but automatic sign-in failed. Please log in.");
      }
    }
    finishConfirmation();
    return () => { active = false; };
  }, [router]);

  return (
    <main className="max-w-[520px] mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-3xl tracking-wider mb-4">EMAIL CONFIRMATION</h1>
      <p className="text-sm text-neutral-600">{message}</p>
      {message.toLowerCase().includes("log in") || message.toLowerCase().includes("expired") ? (
        <a className="inline-block mt-6 underline font-semibold" href="/login">Go to login</a>
      ) : null}
    </main>
  );
}
