'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { BriefcaseBusiness, Building2, ClipboardList, HardHat, LayoutDashboard, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../providers';

const navigation = [
  { href: '/app', label: 'Overview', icon: LayoutDashboard },
  { href: '/app/clients', label: 'Clients', icon: Building2 },
  { href: '/app/locations', label: 'Locations', icon: MapPin },
  { href: '/app/purchase-orders', label: 'Purchase orders', icon: ClipboardList },
  { href: '/app/workers', label: 'Workers', icon: HardHat },
];

export default function ProtectedAppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const currentPage = navigation.find((item) => item.href === pathname)?.label ?? 'Workspace';

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, router, user]);

  async function handleSignOut() {
    setError(null);

    try {
      await signOut();
      router.replace('/login');
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Unable to sign out.');
    }
  }

  if (isLoading || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
        {isLoading ? 'Loading session...' : 'Redirecting...'}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f4] text-slate-900 md:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 text-slate-300 md:flex">
        <Link className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6" href="/app">
          <span className="grid size-9 place-items-center rounded-lg bg-emerald-500 text-white">
            <BriefcaseBusiness size={19} strokeWidth={2.2} />
          </span>
          <span className="text-base font-semibold tracking-normal text-white">Shreeji</span>
        </Link>
        <div className="px-4 pt-8">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Workspace
          </p>
          <nav aria-label="Main navigation" className="grid gap-1">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                    active
                      ? 'bg-white/10 font-medium text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                  href={href}
                  key={href}
                >
                  <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-800 text-sm font-semibold text-emerald-100">
              {(user.email?.[0] ?? 'U').toUpperCase()}
            </span>
            <span className="min-w-0 truncate text-xs text-slate-300">{user.email}</span>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="border-b border-slate-200 bg-white md:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Link className="flex items-center gap-2.5 font-semibold text-slate-900" href="/app">
              <span className="grid size-8 place-items-center rounded-md bg-emerald-700 text-white">
                <BriefcaseBusiness size={17} />
              </span>
              Shreeji
            </Link>
            <button
              aria-label="Sign out"
              className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              onClick={handleSignOut}
              type="button"
            >
              <LogOut size={18} />
            </button>
          </div>
          <nav aria-label="Main navigation" className="flex gap-1 overflow-x-auto px-3 pb-2">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                    active ? 'bg-emerald-50 font-medium text-emerald-800' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                  href={href}
                  key={href}
                >
                  <Icon aria-hidden="true" size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <header className="hidden h-[76px] items-center justify-between border-b border-slate-200 bg-white px-8 md:flex">
          <div>
            <p className="text-xs text-slate-400">Workspace / {currentPage}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{currentPage}</p>
          </div>
          <div className="flex items-center gap-5">
            <span className="max-w-64 truncate text-sm text-slate-500">{user.email}</span>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              onClick={handleSignOut}
              type="button"
            >
              <LogOut aria-hidden="true" size={16} />
              Sign out
            </button>
          </div>
        </header>

        {error && (
          <p className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:mx-8" role="alert">
            {error}
          </p>
        )}
        <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 md:px-8 md:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}