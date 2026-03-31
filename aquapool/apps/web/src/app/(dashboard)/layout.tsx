'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/wallet', label: 'Wallet', icon: '💼' },
  { href: '/markets', label: 'Markets', icon: '📈' },
  { href: '/exchange', label: 'Exchange', icon: '🔄' },
  { href: '/earn', label: 'Earn', icon: '💰' },
  { href: '/send', label: 'Send', icon: '🌍' },
  { href: '/deposit', label: 'Deposit', icon: '⬇️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-white/5 fixed h-full z-40">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="text-xl font-bold text-primary">Aquapool</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted hover:text-white hover:bg-white/5'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted hover:text-white hover:bg-white/5 transition-colors">
            <span className="text-lg">⚙️</span> Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Top header */}
        <header className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="font-semibold capitalize">{pathname.replace('/', '') || 'Dashboard'}</h1>
          <div className="flex items-center gap-4">
            <button className="text-muted hover:text-white transition-colors text-lg">🔔</button>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-medium">
              A
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
