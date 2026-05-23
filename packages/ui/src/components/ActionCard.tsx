import type { ActionCardItem } from '../data/landingContent';
import { MaterialIcon } from './MaterialIcon';

type ActionCardProps = {
  item: ActionCardItem;
};

export function ActionCard({ item }: ActionCardProps) {
  return (
    <a
      href={item.href}
      className="group relative block overflow-hidden rounded-[28px] border border-gray-200 bg-white p-6 text-left shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl"
    >
      <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
        <MaterialIcon className={`text-[88px] leading-none ${item.panelIconClass}`}>{item.panelIcon}</MaterialIcon>
      </div>

      <div className="relative z-10 flex h-full min-h-[198px] flex-col justify-between gap-6">
        <div>
          <div className={`mb-4 inline-flex items-center justify-center rounded-2xl p-3 ${item.iconWrapperClass}`}>
            <MaterialIcon className="text-[28px] leading-none">{item.icon}</MaterialIcon>
          </div>

          <h3 className={`text-[18px] font-bold text-text-main transition-colors md:text-xl ${item.accentHoverClass}`}>
            {item.title}
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-7 text-text-muted">{item.description}</p>
        </div>

        <div className={`flex items-center text-sm font-bold ${item.accentClass}`}>
          {item.cta}
          <MaterialIcon className="ml-1 text-[18px] transition-transform group-hover:translate-x-1">
            arrow_forward
          </MaterialIcon>
        </div>
      </div>
    </a>
  );
}
