'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { AppShell } from '@/components/layout/AppShell';
import { Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authStatus, user } = useResora();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if Firebase has finished initializing and user is confirmed unauthenticated
    if (authStatus === 'unauthenticated' && !user) {
      const fromParam = encodeURIComponent(pathname || '/app');
      router.replace(`/auth?from=${fromParam}`);
    }
  }, [authStatus, user, router, pathname]);

  // While restoring Firebase session (especially after mobile OAuth redirect), render a lightweight branded shell
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#FFFDF5] text-black flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-sm p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] text-center space-y-4">
          <div className="inline-block p-3 bg-[#FFD93D] border-2 border-black">
            <Loader2 className="w-6 h-6 animate-spin text-black" />
          </div>
          <div className="font-mono text-xs font-black uppercase tracking-widest text-black">
            VERIFYING SESSION...
          </div>
          <p className="text-[11px] font-mono text-black/60 font-bold">
            Connecting to your secure research workspace
          </p>
        </div>
      </div>
    );
  }

  // Prevent flash of protected UI if unauthenticated
  if (authStatus === 'unauthenticated' && !user) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
