'use client';

import AdminShell from '@/components/admin/AdminShell';
import ChatInboxView from '@/features/chat/components/ChatInboxView';

export default function AdminChatInboxPage() {
  return (
    <AdminShell
      title="Pesan Masuk"
      subtitle="Kelola pesan bantuan dan komunikasi pengguna CariKos."
    >
      <ChatInboxView
        basePath="/admin/chat"
        embedded
        emptyDescription="Belum ada pesan masuk atau permintaan bantuan dari pengguna."
        emptyActionHref={null}
        emptyActionLabel={null}
      />
    </AdminShell>
  );
}
