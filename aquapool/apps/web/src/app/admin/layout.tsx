'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const adminNav = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/deposits', label: 'Deposits', icon: '💳' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 glass border-r border-white/5 fixed h-full z-40">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="text-lg font-bold text-lime">Aquapool</Link>
          <div className="text-xs text-muted mt-0.5 font-semibold uppercase tracking-wider">Admin Panel</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-lime/10 text-lime border border-lime/20'
                  : 'text-muted hover:text-white hover:bg-white/5'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted hover:text-white hover:bg-white/5 transition-colors">
            <span>↩</span> Back to App
          </Link>
        </div>
      </aside>

      <div className="flex-1 md:ml-60">
        <header className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-lime bg-lime/10 px-2 py-0.5 rounded">Admin</span>
            <span className="text-sm font-semibold capitalize">
              {pathname.split('/').filter(Boolean).slice(1)[0] ?? 'Overview'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-lime/20 border border-lime/30 flex items-center justify-center text-xs font-bold text-lime">
            A
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
