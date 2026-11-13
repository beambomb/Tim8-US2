import { Suspense } from 'react';
import OwnerLayout from '@/features/owner/components/OwnerLayout';

export const metadata = {
  title: 'Portal Pemilik Kos - CariKos',
  description: 'Kelola properti kos, pantau analitik okupansi, dan konfirmasi permohonan booking sewa.',
};

export default function Layout({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0F1D]" />}>
      <OwnerLayout>{children}</OwnerLayout>
    </Suspense>
  );
}
