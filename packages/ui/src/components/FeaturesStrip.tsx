import { features } from '../data/landingContent';
import { MaterialIcon } from './MaterialIcon';

export function FeaturesStrip() {
  return (
    <section className="w-full border-y border-gray-200 bg-white px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 text-center md:justify-between md:text-left">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${feature.iconWrapperClass}`}
            >
              <MaterialIcon className={`${feature.iconClass}`}>{feature.icon}</MaterialIcon>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">{feature.eyebrow}</p>
              <p className="text-lg font-bold text-text-main">{feature.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
