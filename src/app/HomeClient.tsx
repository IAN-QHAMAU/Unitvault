'use client'

import { useState, useMemo } from 'react'
import { Shield, Inbox, BookOpen, ArrowLeft } from 'lucide-react'
import { CourseCard } from '@/components/vault/CourseCard'
import { SearchFilter } from '@/components/vault/SearchFilter'
import type { Unit } from '@/lib/supabase/types'

interface HomeClientProps {
  units: Unit[]
  resourceCountMap: Record<string, number>
}

export function HomeClient({ units, resourceCountMap }: HomeClientProps) {
  const [search, setSearch] = useState('')
  const [selectedProgramme, setSelectedProgramme] = useState<string | null>(null)

  // Filter units based on search term
  const filteredUnits = useMemo(() => {
    const q = search.toLowerCase().trim().replace(/\s+/g, '')
    if (!q) return units
    return units.filter(
      (unit) =>
        unit.code.toLowerCase().replace(/\s+/g, '').includes(q) ||
        unit.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        unit.department?.toLowerCase().includes(search.toLowerCase().trim())
    )
  }, [units, search])

  // Group units by Programme (Department)
  const programmeSummary = useMemo(() => {
    const map: Record<string, Unit[]> = {}

    units.forEach((unit) => {
      const prog = unit.department || 'General Units'
      if (!map[prog]) map[prog] = []
      map[prog].push(unit)
    })

    return Object.entries(map).map(([programmeName, progUnits]) => ({
      name: programmeName,
      unitCount: progUnits.length,
      units: progUnits,
    }))
  }, [units])

  // Get units for the selected programme grouped by Year
  const selectedProgrammeYears = useMemo(() => {
    if (!selectedProgramme) return []

    const progUnits = filteredUnits.filter(
      (u) => (u.department || 'General Units') === selectedProgramme
    )

    const yearMap: Record<string, Unit[]> = {}
    progUnits.forEach((unit) => {
      const yearKey = unit.year ? `Year ${unit.year}` : 'Other'
      if (!yearMap[yearKey]) yearMap[yearKey] = []
      yearMap[yearKey].push(unit)
    })

    return Object.entries(yearMap).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredUnits, selectedProgramme])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E3A8A] mb-4">
          <Shield size={26} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">UnitVault</h1>
        <p className="text-[#64748B] text-lg max-w-md mx-auto">
          Pick your programme or unit to find notes and past papers.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-lg mx-auto mb-8">
        <SearchFilter
          value={search}
          onChange={(val) => {
            setSearch(val)
            if (val && selectedProgramme) {
              // Reset programme filter when globally searching
              setSelectedProgramme(null)
            }
          }}
          placeholder="Search by unit code, e.g. SMA 3104..."
        />
        {search && (
          <p className="text-sm text-[#64748B] mt-2 text-center">
            {filteredUnits.length} unit{filteredUnits.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* SEARCH ACTIVE: Render flat matching results */}
      {search ? (
        filteredUnits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Inbox size={24} className="text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">
              No units match "{search}"
            </h3>
            <p className="text-sm text-[#64748B] max-w-xs">
              Try a different code or name.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnits.map((unit) => (
              <CourseCard
                key={unit.id}
                course={unit}
                resourceCount={resourceCountMap[unit.id] || 0}
              />
            ))}
          </div>
        )
      ) : selectedProgramme ? (
        /* PROGRAMME SELECTED VIEW */
        <div className="space-y-8">
          <button
            onClick={() => setSelectedProgramme(null)}
            className="inline-flex items-center text-sm font-medium text-[#1E3A8A] hover:underline gap-1.5 mb-2"
          >
            <ArrowLeft size={16} /> All Programmes
          </button>

          <div className="border-b border-[#E2E8F0] pb-4">
            <h2 className="text-2xl font-bold text-[#0F172A]">{selectedProgramme}</h2>
            <p className="text-sm text-[#64748B] mt-1">
              Select a unit below to view past papers and notes.
            </p>
          </div>

          <div className="space-y-8">
            {selectedProgrammeYears.map(([year, yearCourses]) => (
              <div key={year}>
                <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-widest mb-3">
                  {year}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {yearCourses.map((unit) => (
                    <CourseCard
                      key={unit.id}
                      course={unit}
                      resourceCount={resourceCountMap[unit.id] || 0}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* DEFAULT VIEW: Programme Title Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programmeSummary.map((prog) => (
            <div
              key={prog.name}
              onClick={() => setSelectedProgramme(prog.name)}
              className="group bg-white border border-[#E2E8F0] rounded-2xl p-6 cursor-pointer hover:border-[#1E3A8A] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-4 group-hover:bg-[#1E3A8A] transition-colors">
                  <BookOpen size={20} className="text-[#1E3A8A] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#1E3A8A] transition-colors">
                  {prog.name}
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  {prog.unitCount} Unit{prog.unitCount !== 1 ? 's' : ''} available
                </p>
              </div>

              <div className="mt-6 flex items-center text-xs font-semibold text-[#1E3A8A]">
                Explore Units &rarr;
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-[#E2E8F0] text-center">
        <p className="text-sm text-slate-400">
          <span className="font-semibold text-[#1E3A8A]">UnitVault</span>
          {' · '}
          <em className="not-italic text-slate-500 tracking-wide">Kwani me hudoo</em>
        </p>
      </footer>
    </main>
  )
}