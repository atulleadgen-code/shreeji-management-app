'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Building2, ClipboardList, LoaderCircle, MapPin } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/components/toast-provider';

type CountRow = { id: string };

const metrics = [
  { key: 'clients', label: 'Clients', href: '/app/clients', icon: Building2, iconClass: 'bg-emerald-50 text-emerald-800' },
  { key: 'locations', label: 'Locations', href: '/app/locations', icon: MapPin, iconClass: 'bg-sky-50 text-sky-800' },
  { key: 'purchase-orders', label: 'Purchase orders', href: '/app/purchase-orders', icon: ClipboardList, iconClass: 'bg-amber-50 text-amber-800' },
] as const;

export default function DashboardPage() {
  const [counts, setCounts] = useState<Record<string, number>>({ clients: 0, locations: 0, 'purchase-orders': 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    const resources = ['clients', 'locations', 'purchase-orders'] as const;

    void Promise.all(resources.map((resource) => apiRequest<CountRow[]>(resource, { signal: controller.signal })))
      .then(([clients, locations, purchaseOrders]) => {
        setCounts({
          clients: clients.length,
          locations: locations.length,
          'purchase-orders': purchaseOrders.length,
        });
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          const message = requestError instanceof Error ? requestError.message : 'Unable to load workspace totals.';
          setError(message);
          notify('error', message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [notify]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-900">Overview</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ key, label, href, icon: Icon, iconClass }) => (
          <Link
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.025] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            href={href}
            key={key}
          >
            <div className="flex items-start justify-between">
              <span className={`grid size-10 place-items-center rounded-lg ${iconClass}`}>
                <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
              </span>
              <ArrowRight aria-hidden="true" className="text-slate-300 transition-colors group-hover:text-emerald-800" size={18} />
            </div>
            <p className="mt-6 text-sm font-medium text-slate-500">Total {label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">
              {isLoading ? <LoaderCircle aria-label="Loading" className="animate-spin text-slate-300" size={25} /> : error ? '—' : counts[key].toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
      <div className="border-t border-slate-200 pt-6">
        <h2 className="text-sm font-semibold text-slate-800">Data management</h2>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {metrics.map(({ href, label }) => (
            <Link className="text-slate-500 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-emerald-800" href={href} key={href}>
              View {label.toLowerCase()}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}