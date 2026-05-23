import { footerLinks } from '../data/landingContent';
import { MaterialIcon } from './MaterialIcon';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-background-light px-6 pb-8 pt-16 lg:px-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
        <div className="mb-8 flex flex-col items-center gap-4">
          <MaterialIcon className="text-4xl text-text-muted/50">waves</MaterialIcon>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-x-8 gap-y-4">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-text-muted transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="text-sm text-text-muted">
          © 2025/2026 Program RKI (Riset Kolaborasi Indonesia) EQUITY : Universitas Negeri Surabaya-Universitas Pendidikan Indonesia-Universitas Jember
        </div>
      </div>
    </footer>
  );
}
