'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatInboxView from '@/features/chat/components/ChatInboxView';
import { useAuth } from '@/context/AuthContext';

export default function ChatInboxPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const portalTarget =
    isAuthenticated && user?.role === 'ADMIN'
      ? '/admin/chat'
      : isAuthenticated && user?.role === 'PEMILIK_KOS'
      ? '/owner/chat'
      : null;

  useEffect(() => {
    if (!authLoading && portalTarget) {
      router.replace(portalTarget);
    }
  }, [authLoading, portalTarget, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-subtle)]">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {portalTarget ? (
          <div className="min-h-[320px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ChatInboxView basePath="/chat" />
        )}
      </main>
      <Footer />
    </div>
  );
}
