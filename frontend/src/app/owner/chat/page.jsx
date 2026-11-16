'use client';

import PortalPageHeader from '@/components/portal/PortalPageHeader';
import ChatInboxView from '@/features/chat/components/ChatInboxView';

export default function OwnerChatInboxPage() {
  return (
    <div className="flex flex-col gap-6">
      <PortalPageHeader
        title="Pesan Masuk"
        subtitle="Kelola obrolan dengan pencari kos dan tim dukungan CariKos."
      />
      <ChatInboxView
        basePath="/owner/chat"
        embedded
        emptyDescription="Belum ada pesan masuk dari pencari kos atau tim dukungan."
        emptyActionHref={null}
        emptyActionLabel={null}
      />
    </div>
  );
}
