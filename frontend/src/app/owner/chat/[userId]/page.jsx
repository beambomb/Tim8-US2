'use client';

import { Suspense } from 'react';
import ChatRoomView from '@/features/chat/components/ChatRoomView';

function ChatRoomFallback() {
  return (
    <div className="min-h-[420px] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function OwnerChatRoomPage() {
  return (
    <Suspense fallback={<ChatRoomFallback />}>
      <ChatRoomView
        basePath="/owner/chat"
        embedded
        heightClass="h-[calc(100dvh-6rem)] min-h-[480px]"
      />
    </Suspense>
  );
}
