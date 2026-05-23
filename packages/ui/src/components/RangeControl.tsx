import { FieldInfo } from './FieldInfo';
import { MaterialIcon } from './MaterialIcon';

type RangeControlProps = {
  icon: string;
  label: string;
  infoText: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  formatValue: (value: number) => string;
  tickLabels: [string, string, string];
};

export function RangeControl({
  icon,
  label,
  infoText,
  min,
  max,
  step,
  value,
  onChange,
  formatValue,
  tickLabels,
}: RangeControlProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-text-main">
          <MaterialIcon className="text-[20px] text-primary">{icon}</MaterialIcon>
          <span>{label}</span>
          <FieldInfo text={infoText} />
        </label>
        <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-bold text-primary tabular-nums">{formatValue(value)}</span>
      </div>

      <input
        className="range-slider h-5 w-full cursor-pointer"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />

      <div className="flex justify-between px-1 text-xs font-medium text-slate-400">
        {tickLabels.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>
  );
}
