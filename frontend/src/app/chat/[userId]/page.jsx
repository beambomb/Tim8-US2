'use client';

import { Suspense, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatRoomView from '@/features/chat/components/ChatRoomView';
import { useAuth } from '@/context/AuthContext';

function ChatRoomPageContent() {
  const { userId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const targetUserId = Array.isArray(userId) ? userId[0] : userId;
  const queryString = searchParams.toString();
  const suffix = queryString ? `?${queryString}` : '';

  const portalTarget =
    targetUserId && isAuthenticated && user?.role === 'ADMIN'
      ? `/admin/chat/${targetUserId}${suffix}`
      : targetUserId && isAuthenticated && user?.role === 'PEMILIK_KOS'
      ? `/owner/chat/${targetUserId}${suffix}`
      : null;

  useEffect(() => {
    if (!authLoading && portalTarget) {
      router.replace(portalTarget);
    }
  }, [authLoading, portalTarget, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-subtle)]">
      <Navbar />
      <main className="flex-1 pt-16">
        {portalTarget ? (
          <div className="min-h-[360px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ChatRoomView basePath="/chat" />
        )}
      </main>
    </div>
  );
}

export default function ChatRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-subtle)]">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ChatRoomPageContent />
    </Suspense>
  );
}
