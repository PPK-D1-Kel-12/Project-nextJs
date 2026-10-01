'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toggleTheme } from '@/actions/theme';
import { LogoutButton } from './auth/logout-button';

interface NavbarProps {
  initialTheme?: 'light' | 'dark';
  userName?: string;
}

export function Navbar({ initialTheme = 'light', userName = 'Bram' }: NavbarProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState<boolean>(initialTheme === 'dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Jangan tampilkan navbar di halaman auth
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleToggleTheme = async () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const nextDark = !isCurrentlyDark;
    
    // Ubah class DOM secara instan tanpa reload
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setIsDark(nextDark);

    try {
      await toggleTheme();
    } catch (err) {
      console.error('Gagal memperbarui preferensi tema:', err);
    }
  };

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      name: 'Riwayat Transaksi',
      href: '/transactions',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
          <path d="M8 7h8" />
          <path d="M8 11h8" />
          <path d="M8 15h5" />
        </svg>
      ),
    },
    {
      name: 'Anggaran',
      href: '/budgets',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-8 5H5a2 2 0 0 1-2-2V7" />
          <path d="M16 11h.01" />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-2 sm:top-4 z-40 w-full px-3 sm:px-6 transition-all">
      <div className="max-w-6xl mx-auto clay-card px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 font-bold text-slate-900 dark:text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="clay-water-pod w-10 h-10 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-300">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-8 5H6a2 2 0 0 1-2-2V7" />
                <path d="M18 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
              </svg>
            </div>
            <span className="text-base sm:text-lg tracking-tight font-extrabold leading-tight bg-gradient-to-r from-stone-900 to-sky-700 dark:from-white dark:to-sky-300 bg-clip-text text-transparent">
              Expense Tracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'clay-water-pod text-sky-700 dark:text-sky-300 font-bold'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: User & Actions */}
        <div className="flex items-center gap-3">
          {/* User Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full clay-badge bg-white dark:bg-[#1a2942] text-slate-700 dark:text-slate-200 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
            <span>{userName}</span>
          </div>

          {/* Theme Toggle Button (SRS-06) */}
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label="Toggle Mode Terang / Gelap"
            title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            className="w-10 h-10 rounded-xl clay-water-pod flex items-center justify-center transition-all cursor-pointer"
          >
            {isDark ? (
              // Sun Icon
              <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              // Moon Icon
              <svg className="w-4 h-4 text-sky-700 dark:text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>

          {/* Logout Button (SRS-04) */}
          <div className="hidden sm:block">
            <LogoutButton className="px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 clay-btn-secondary hover:text-rose-700 dark:hover:text-rose-300 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer" />
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu navigasi mobile"
            className="md:hidden w-10 h-10 rounded-xl clay-water-pod flex items-center justify-center cursor-pointer text-sky-700 dark:text-sky-300"
          >
            {isMobileMenuOpen ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-6xl mx-auto clay-card p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span>Masuk sebagai</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{userName}</span>
          </div>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'clay-water-pod text-sky-700 dark:text-sky-300 font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <LogoutButton className="w-full justify-center px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 clay-btn-secondary rounded-xl transition-all flex items-center gap-1.5 cursor-pointer" />
          </div>
        </div>
      )}
    </header>
  );
}
