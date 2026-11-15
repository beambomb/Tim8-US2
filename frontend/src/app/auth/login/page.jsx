import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export const metadata = { title: "Masuk - CariKos" };

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh grid place-items-center bg-[#F5F7FA] px-4 text-sm text-[#475569]">
          Memuat formulir...
        </main>
      }
    >
      <AuthForm mode="login" />
    </Suspense>
  );
}
