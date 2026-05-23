import { MaterialIcon } from './MaterialIcon';

type FeatureItem = {
  icon: string;
  label: string;
};

type DetailItem = {
  label: string;
  value: string;
  valueClassName?: string;
};

type ScenarioModeCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  badgeLabel: string;
  badgeClassName: string;
  icon: string;
  buttonLabel: string;
  buttonHref: string;
  buttonVariant?: 'solid' | 'outline';
  features?: FeatureItem[];
  details?: DetailItem[];
};

export function ScenarioModeCard({
  title,
  description,
  imageSrc,
  imageAlt,
  badgeLabel,
  badgeClassName,
  icon,
  buttonLabel,
  buttonHref,
  buttonVariant = 'solid',
  features,
  details,
}: ScenarioModeCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-light bg-surface-light shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-sm ${badgeClassName}`}>
          {badgeLabel}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3 className="text-[20px] font-bold text-text-main">{title}</h3>
          <MaterialIcon className="text-[22px] text-text-secondary-light">{icon}</MaterialIcon>
        </div>

        <p className="mb-6 text-sm leading-8 text-text-secondary-light">{description}</p>

        {features ? (
          <div className="mb-8 space-y-3">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 text-sm text-text-secondary-light">
                <MaterialIcon className="text-[20px] text-primary">{feature.icon}</MaterialIcon>
                <span>{feature.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        {details ? (
          <div className="mb-8 rounded-xl border border-border-light bg-background-light p-4">
            <div className="flex flex-col gap-3">
              {details.map((detail, index) => (
                <div key={detail.label}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-text-secondary-light">{detail.label}</span>
                    <span className={`font-medium ${detail.valueClassName ?? 'text-text-main'}`}>{detail.value}</span>
                  </div>
                  {index < details.length - 1 ? <div className="mt-3 h-px bg-border-light" /> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <a
          href={buttonHref}
          className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-center text-base font-semibold transition-colors ${
            buttonVariant === 'outline'
              ? 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
              : 'bg-primary text-white shadow-md hover:bg-primary-dark'
          }`}
        >
          <span>{buttonLabel}</span>
          <MaterialIcon className="text-[18px] leading-none">
            {buttonVariant === 'outline' ? 'add_circle' : 'arrow_forward'}
          </MaterialIcon>
        </a>
      </div>
    </article>
  );
}
