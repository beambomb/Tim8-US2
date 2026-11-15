"use client";

import PortalShell from "@/components/portal/PortalShell";
import PortalPageHeader from "@/components/portal/PortalPageHeader";

function NavIcon({ kind }) {
  if (kind === "dashboard") {
    return (
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    );
  }

  if (kind === "submissions") {
    return (
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }

  return (
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Ringkasan",
    icon: <NavIcon kind="dashboard" />,
    exact: true,
  },
  {
    href: "/admin/submissions",
    label: "Verifikasi Kos",
    icon: <NavIcon kind="submissions" />,
  },
  {
    href: "/admin/users",
    label: "Pengguna",
    icon: <NavIcon kind="users" />,
  },
];

export default function AdminShell({
  children,
  title,
  subtitle,
  headerAction = null,
}) {
  return (
    <PortalShell
      portalLabel="Portal Admin"
      brandHref="/admin/dashboard"
      navItems={navItems}
      navLabel="Navigasi administrator"
      navSectionLabel="Menu administrasi"
      allowedRole="ADMIN"
      loadingText="Memeriksa akses administrator..."
      redirectOnUnauthorized={true}
      fallbackUserName="Administrator"
      fallbackUserSubtext="Tim Kurasi CariKos"
    >
      <div className="flex flex-col gap-6">
        <PortalPageHeader
          title={title}
          subtitle={subtitle}
          actions={headerAction}
        />
        <div>{children}</div>
      </div>
    </PortalShell>
  );
}
