import { INV_FLAG_OPTIONS, type InvFlagMode } from "@/lib/rental/inv-flags";

type InvFlagSelectProps = {
  value: InvFlagMode;
  onChange: (mode: InvFlagMode) => void;
  id?: string;
};

export function InvFlagSelect({ value, onChange, id }: InvFlagSelectProps) {
  return (
    <select
      id={id}
      className="inv-flag-select"
      value={value}
      onChange={(e) => onChange(e.target.value as InvFlagMode)}
    >
      {INV_FLAG_OPTIONS.map((opt) => (
        <option key={opt.value || "none"} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
