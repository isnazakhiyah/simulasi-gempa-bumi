import { MaterialIcon } from './MaterialIcon';

export function Brand() {
  return (
    <div className="flex items-center gap-3 text-primary">
      <MaterialIcon className="text-[32px] leading-none text-primary">tsunami</MaterialIcon>
      <h2 className="text-xl font-bold tracking-tight text-text-main">Simulasi Gempa</h2>
    </div>
  );
}
