import { MaterialIcon } from './MaterialIcon';

type FieldInfoProps = {
  text: string;
};

export function FieldInfo({ text }: FieldInfoProps) {
  return (
    <span className="group relative inline-flex cursor-help items-center justify-center">
      <MaterialIcon className="text-[16px] text-slate-400">info</MaterialIcon>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded-lg bg-slate-800 p-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}
