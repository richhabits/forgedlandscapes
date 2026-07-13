import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLogin } from "./login-client";

export const metadata: Metadata = {
  title: "Admin sign-in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 md:px-10 py-24 flex justify-center">
      <Suspense fallback={null}>
        <AdminLogin />
      </Suspense>
    </div>
  );
}
