import { ChevronDown } from 'lucide-react';

type TimeSelectProps = {
  id: number | string; 
  label: string;
  value?: string;
  onChange: (value: string) => void;
  hasError: boolean;
}

const TIMES = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4)
    .toString()
    .padStart(2, "0");
  const m = ((i % 4) * 15).toString().padStart(2, "0");
  return `${h}:${m}`
});

function format12Hour(time24: string) {
  // time24 is expected as "HH:mm", e.g. "14:30"
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // convert 0 -> 12, 13 -> 1, etc.
  return `${hour}:${minute} ${ampm}`;
}

export default function TimeSelect({ id, label, value, onChange, hasError }: TimeSelectProps) {
  return (
    <div className={`relative flex flex-col w-full min-w-0 ${hasError ? "border-2 border-red-200" : ""}`}>
      <label htmlFor={`start-${id.toString()}`} className="text-[.7rem] text-gray-500 mb-1">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md px-2 py-2 w-full bg-white text-[.9rem] h-10"
      >
        <option value="" disabled>
          Select time
        </option>
        {TIMES.map((t) => (
          <option key={t} value={t}>
            {format12Hour(t)}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2 top-8 flex items-center">
        <ChevronDown size={16} className="text-gray-400" />
      </div>
    </div>
  )
}