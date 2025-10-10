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
      {label && <div className="text-sm font-medium text-gray-700">{label}</div>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border border-krborder rounded-md bg-white focus:border-krgold focus:ring-1 focus:ring-krgold ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}