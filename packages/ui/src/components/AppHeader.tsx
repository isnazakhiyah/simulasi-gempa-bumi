import { useState } from 'react';
import { MaterialIcon } from './MaterialIcon';

export type HeaderNavItem = {
  label: string;
  href: string;
  active?: boolean;
};

type AppHeaderProps = {
  brandIcon: string;
  brandTitle?: string;
  brandIconMode?: 'plain' | 'badge';
  navItems: HeaderNavItem[];
  maxWidthClass?: string;
  avatarSrc?: string;
  avatarAlt?: string;
};

export function AppHeader({
  brandIcon,
  brandTitle = 'Simulasi Gempa',
  brandIconMode = 'plain',
  navItems,
  maxWidthClass = 'max-w-[1280px]',
  avatarSrc,
  avatarAlt = 'Avatar pengguna',
}: AppHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border-light bg-surface-light/90 backdrop-blur-md">
      <div className={`mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-10 ${maxWidthClass}`}>
        <a href="/" className="flex items-center gap-4 text-text-main no-underline">
          {brandIconMode === 'badge' ? (
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MaterialIcon className="text-[26px] leading-none">{brandIcon}</MaterialIcon>
            </div>
          ) : (
            <div className="flex size-8 items-center justify-center text-primary">
              <MaterialIcon className="text-[32px] leading-none">{brandIcon}</MaterialIcon>
            </div>
          )}
          <h2 className="text-lg font-bold leading-tight tracking-tight sm:text-xl">{brandTitle}</h2>
        </a>

        <div className="hidden flex-1 items-center justify-end gap-8 md:flex">
          <nav className="flex items-center gap-8 lg:gap-10">
            {navItems.map((item) => (
              <a
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  item.active ? 'text-primary' : 'text-slate-700 hover:text-primary'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          {/*
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={avatarAlt}
              className="size-10 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <button className="flex h-10 min-w-[92px] items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-dark">
              Masuk
            </button>
          )}
          */}
        </div>

        <button
          className="rounded-xl p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
          aria-label="Buka menu"
          aria-expanded={open}
        >
          <MaterialIcon>{open ? 'close' : 'menu'}</MaterialIcon>
        </button>
      </div>

      {open ? (
        <div className={`mx-auto px-4 pb-4 md:hidden ${maxWidthClass}`}>
          <div className="rounded-2xl border border-border-light bg-surface-light p-4 shadow-hero">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={`${item.label}-${item.href}-mobile`}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    item.active ? 'bg-blue-50 text-primary' : 'text-slate-700 hover:bg-slate-100 hover:text-primary'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/*
            {avatarSrc ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-border-light bg-slate-50 px-3 py-2">
                <img src={avatarSrc} alt={avatarAlt} className="size-10 rounded-full object-cover ring-2 ring-primary/20" />
                <div>
                  <p className="text-sm font-semibold text-text-main">Pengguna Aktif</p>
                  <p className="text-xs text-slate-500">Profil simulasi</p>
                </div>
              </div>
            ) : (
              <button className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-dark">
                Masuk
              </button>
            )}
            */}
          </div>
        </div>
      ) : null}
    </header>
  );
}
