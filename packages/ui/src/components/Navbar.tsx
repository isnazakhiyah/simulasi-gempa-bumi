import { useState } from 'react';
import { navItems } from '../data/landingContent';
import { Brand } from './Brand';
import { MaterialIcon } from './MaterialIcon';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/90 bg-surface-light/80 px-6 py-4 backdrop-blur-md transition-all lg:px-12">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between">
        <Brand />

        <div className="hidden flex-1 items-center justify-end gap-8 md:flex">
          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                className="text-sm font-medium text-text-main/80 transition-colors hover:text-primary"
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button className="flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark">
            Masuk
          </button>
        </div>

        <button
          className="rounded-lg p-2 text-text-main transition-colors hover:bg-white/70 md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
          aria-label="Buka menu navigasi"
          aria-expanded={isOpen}
        >
          <MaterialIcon>{isOpen ? 'close' : 'menu'}</MaterialIcon>
        </button>
      </div>

      {isOpen ? (
        <div className="mx-auto mt-4 max-w-[1280px] rounded-2xl border border-gray-200 bg-white p-4 shadow-hero md:hidden">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                className="rounded-xl px-3 py-2 text-sm font-medium text-text-main transition-colors hover:bg-blue-50 hover:text-primary"
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white transition-all hover:bg-primary-dark">
            Masuk
          </button>
        </div>
      ) : null}
    </header>
  );
}
