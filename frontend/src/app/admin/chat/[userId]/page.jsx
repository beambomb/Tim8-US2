'use client';

import { Suspense } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import ChatRoomView from '@/features/chat/components/ChatRoomView';

function ChatRoomFallback() {
  return (
    <div className="min-h-[420px] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AdminChatRoomPage() {
  return (
    <AdminShell
      title="Ruang Obrolan"
      subtitle="Balas pesan dan pertanyaan bantuan secara real-time."
    >
      <Suspense fallback={<ChatRoomFallback />}>
        <ChatRoomView
          basePath="/admin/chat"
          embedded
          heightClass="h-[calc(100dvh-13rem)] min-h-[460px]"
        />
      </Suspense>
    </AdminShell>
  );
}
