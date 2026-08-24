'use client'

import { Search, X } from 'lucide-react'

interface SearchFilterProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function SearchFilter({
  value,
  onChange,
  placeholder = 'Search by course code or name...',
  className = '',
}: SearchFilterProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

interface TypeFilterProps {
  value: string
  onChange: (v: string) => void
}

export function TypeFilter({ value, onChange }: TypeFilterProps) {
  const options = [
    { label: 'All', value: 'all' },
    { label: 'Notes', value: 'Notes' },
    { label: 'Past Papers', value: 'Past Paper' },
  ]

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            value === opt.value
              ? 'bg-white text-[#1E3A8A] shadow-sm'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
