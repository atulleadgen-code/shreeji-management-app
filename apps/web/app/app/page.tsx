'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Building2, ClipboardList, LoaderCircle, TriangleAlert } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useToast } from '@/components/toast-provider';

type RecentPurchaseOrder = {
  id: string;
  po_number: string;
  order_date: string;
  total_amount: string | null;
  status: string;
  client_name: string;
  location_name: string;
};

type DashboardStats = {
  activeClientCount: number;
  purchaseOrderCount: number;
  totalRevenue: number;
  recentPurchaseOrders: RecentPurchaseOrder[];
};

const metrics = [
  { key: 'activeClientCount', label: 'Active Clients', href: '/app/clients', icon: Building2, iconClass: 'bg-emerald-50 text-emerald-800' },
  { key: 'purchaseOrderCount', label: 'Total Purchase Orders', href: '/app/purchase-orders', icon: ClipboardList, iconClass: 'bg-sky-50 text-sky-800' },
  { key: 'totalRevenue', label: 'Total Revenue', href: '/app/purchase-orders', icon: ArrowRight, iconClass: 'bg-amber-50 text-amber-800' },
] as const;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();

  useEffect(() => {
    const controller = new AbortController();

    void apiRequest<DashboardStats>('dashboard/stats', { signal: controller.signal })
      .then(setStats)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          const message = requestError instanceof Error ? requestError.message : 'Unable to load dashboard statistics.';
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

  function getMetricValue(key: (typeof metrics)[number]['key']) {
    if (!stats) return '—';
    if (key === 'totalRevenue') {
      return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(stats.totalRevenue);
    }
    return stats[key].toLocaleString();
  }

  function formatDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? '—' : date.toLocaleDateString();
  }

  function formatAmount(value: string | null) {
    if (value === null) return '—';
    const amount = Number(value);
    return Number.isFinite(amount)
      ? new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
      : '—';
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-900">Overview</h1>
      </div>
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <TriangleAlert aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}
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
            <p className="mt-6 text-sm font-medium text-slate-500">{label}</p>
            <div className="mt-1 min-h-9 text-3xl font-semibold tabular-nums text-slate-900">
              {isLoading ? (
                <LoaderCircle aria-label="Loading" className="animate-spin text-slate-300" size={25} />
              ) : (
                getMetricValue(key)
              )}
            </div>
          </Link>
        ))}
      </div>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.025]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Recent 5 Purchase Orders</h2>
            <p className="mt-1 text-xs text-slate-500">Latest orders by creation date</p>
          </div>
          <Link className="inline-flex items-center gap-1 text-sm font-medium text-emerald-800 hover:text-emerald-950" href="/app/purchase-orders">
            All orders <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3 p-5" role="status">
            <span className="sr-only">Loading recent Purchase Orders</span>
            {[0, 1, 2, 3, 4].map((item) => (
              <div className="h-10 animate-pulse rounded-md bg-slate-100" key={item} />
            ))}
          </div>
        ) : error ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">Recent orders are unavailable.</p>
        ) : stats?.recentPurchaseOrders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                <tr>
                  <th className="px-5 py-3.5" scope="col">PO number</th>
                  <th className="px-5 py-3.5" scope="col">Client</th>
                  <th className="px-5 py-3.5" scope="col">Location</th>
                  <th className="px-5 py-3.5" scope="col">Date</th>
                  <th className="px-5 py-3.5 text-right" scope="col">Amount</th>
                  <th className="px-5 py-3.5" scope="col">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentPurchaseOrders.map((order) => (
                  <tr className="transition-colors hover:bg-slate-50/80" key={order.id}>
                    <td className="px-5 py-4 font-medium text-slate-800">{order.po_number}</td>
                    <td className="px-5 py-4 text-slate-700">{order.client_name}</td>
                    <td className="px-5 py-4 text-slate-700">{order.location_name}</td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(order.order_date)}</td>
                    <td className="px-5 py-4 text-right tabular-nums text-slate-700">{formatAmount(order.total_amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        ['approved', 'completed'].includes(order.status.toLowerCase())
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-44 place-items-center px-6 py-10 text-center">
            <div>
              <span className="mx-auto mb-3 grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-500">
                <ClipboardList aria-hidden="true" size={19} />
              </span>
              <p className="text-sm font-medium text-slate-800">No Purchase Orders yet</p>
              <p className="mt-1 text-sm text-slate-500">New orders will appear here.</p>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}