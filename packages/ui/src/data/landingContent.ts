export type NavItem = {
  label: string;
  href: string;
};

export type ActionCardItem = {
  title: string;
  description: string;
  cta: string;
  href: string;
  accentClass: string;
  accentHoverClass: string;
  icon: string;
  panelIcon: string;
  panelIconClass: string;
  iconWrapperClass: string;
};

export type FeatureItem = {
  eyebrow: string;
  title: string;
  icon: string;
  iconWrapperClass: string;
  iconClass: string;
};

export type FooterLink = NavItem;

export const navItems: NavItem[] = [];

export const actionCards: ActionCardItem[] = [
  {
    title: 'Mulai Eksplorasi',
    description:
      'Simulasikan parameter gempa dan amati dampaknya secara real-time pada berbagai struktur tanah.',
    cta: 'Mulai Sekarang',
    href: '/simulasi',
    accentClass: 'text-primary',
    accentHoverClass: 'group-hover:text-primary',
    icon: 'science',
    panelIcon: 'public',
    panelIconClass: 'text-primary',
    iconWrapperClass: 'bg-blue-50 text-primary',
  },
  {
    title: 'Mode Diskusi Kelas',
    description:
      'Skenario kasus khusus untuk bahan diskusi kelas dan analisis mitigasi bencana bersama siswa.',
    cta: 'Masuk Kelas',
    href: '/simulasi',
    accentClass: 'text-purple-600',
    accentHoverClass: 'group-hover:text-purple-600',
    icon: 'co_present',
    panelIcon: 'groups',
    panelIconClass: 'text-purple-500',
    iconWrapperClass: 'bg-purple-50 text-purple-600',
  },
];

export const features: FeatureItem[] = [
  {
    eyebrow: 'Data Gempa',
    title: 'Berbasis Data Historis BMKG',
    icon: 'analytics',
    iconWrapperClass: 'bg-green-100',
    iconClass: 'text-green-600',
  },
  {
    eyebrow: 'Pembelajaran',
    title: 'STEM Kebencanaan',
    icon: 'menu_book',
    iconWrapperClass: 'bg-blue-100',
    iconClass: 'text-blue-600',
  },
  {
    eyebrow: 'Simulasi Interaktif',
    title: 'Berbasis AI',
    icon: 'devices',
    iconWrapperClass: 'bg-orange-100',
    iconClass: 'text-orange-600',
  },
];

export const footerLinks: FooterLink[] = [];
