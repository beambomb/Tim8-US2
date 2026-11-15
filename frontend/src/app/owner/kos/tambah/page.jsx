'use client';

import PortalPageHeader from '@/components/portal/PortalPageHeader';
import OwnerKosForm from '@/features/owner/components/OwnerKosForm';

export default function OwnerAddKosPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PortalPageHeader
        backHref="/owner/kos"
        backLabel="Kembali ke Inventaris Kos"
        title="Pendaftaran Properti Kos Baru"
        subtitle="Isi spesifikasi kos dengan lengkap, tentukan koordinat lokasi, dan sertakan foto asli untuk mempercepat persetujuan verifikasi."
      />

      {/* Reusable Form in Create Mode */}
      <OwnerKosForm isEdit={false} />
    </div>
  );
}
