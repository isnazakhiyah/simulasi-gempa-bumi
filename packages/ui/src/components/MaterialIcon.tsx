import type { ReactNode } from 'react';

type MaterialIconProps = {
  children: ReactNode;
  className?: string;
};

export function MaterialIcon({ children, className = '' }: MaterialIconProps) {
  return <span className={`material-symbols-outlined ${className}`.trim()}>{children}</span>;
}
