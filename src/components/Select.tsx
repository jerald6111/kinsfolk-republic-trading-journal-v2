import React from 'react';

type Props = {
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  label?: string;
  className?: string;
};

export default function Select({ value, onChange, options, label, className = '' }: Props) {
  return (
    <div className="space-y-1">
      {label && <div className="text-sm font-medium text-krtext">{label}</div>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border border-krborder rounded-md bg-krcard text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-krcard text-krtext">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}