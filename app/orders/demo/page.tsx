'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    async function findDelayedOrder() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        const delayed = data.orders?.find((o: any) => o.isDelayed);
        if (delayed) {
          router.replace(`/orders/${delayed.id}`);
        } else if (data.orders?.[0]) {
          router.replace(`/orders/${data.orders[0].id}`);
        } else {
          router.replace('/orders');
        }
      } catch {
        router.replace('/orders');
      }
    }

    findDelayedOrder();
  }, [router]);

  return (
    <div className="max-w-md mx-auto p-12 text-center text-xs text-slate-500">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto mb-3" />
      <span>Loading MediReach Delay Fallback Scenario...</span>
    </div>
  );
}

