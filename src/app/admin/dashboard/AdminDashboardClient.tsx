// @ts-nocheck
'use client'

import { useState, useRef } from 'react'
import {
  Plus, Trash2, Upload, FileText,
  Loader2, CheckCircle, X, GraduationCap
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Resource, ResourceType, Unit } from '@/lib/supabase/types'

interface AdminDashboardClientProps {
  units: Unit[]
  resources: (Resource & { unit?: { code: string; name: string } | null })[]
}

export function AdminDashboardClient({ units: initial, resources: initialResources }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'units' | 'resources'>('units')
  const [units, setUnits] = useState(initial)
  const [resources, setResources] = useState(initialResources)

  const resourceCount = resources.reduce((acc, r) => {
    acc[r.unit_id] = (acc[r.unit_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const tabs = [
    { key: 'units' as const, label: 'Units', count: units.length },
    { key: 'resources' as const, label: 'Resources', count: resources.length },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeTab === tab.key
                ? 'border-[#1E3A8A] text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
              activeTab === tab.key
                ? 'bg-[#1E3A8A] text-white'
                : 'bg-slate-800 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'units' && (
        <UnitsTab
          units={units}
          setUnits={setUnits}
          resourceCount={resourceCount}
        />
      )}
      {activeTab === 'resources' && (
        <ResourcesTab
          units={units}
          resources={resources}
          setResources={setResources}
        />
      )}
    </div>
  )
}

// ─── Units Tab ────────────────────────────────────────────────────────────────

function UnitsTab({
  units,
  setUnits,
  resourceCount,
}: {
  units: Unit[]
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>
  resourceCount: Record<string, number>
}) {
  const [showForm, setShowForm] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [semester, setSemester] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = async () => {
    if (!code.trim() || !name.trim()) return
    setSaving(true)
    setError('')

    const response = await fetch('/api/admin/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        department: department.trim() || null,
        year: year ? Number(year) : null,
        semester: semester ? Number(semester) : null,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      setError(result.error || 'Failed to add unit')
    } else {
      setUnits((prev) => [...prev, result.unit].sort((a, b) => a.code.localeCompare(b.code)))
      setCode(''); setName(''); setDepartment(''); setYear(''); setSemester('')
      setShowForm(false)
    }
    setSaving(false)
  }

  const handleDelete = async (unit: Unit) => {
    const count = resourceCount[unit.id] || 0
    if (!confirm(
      `Delete "${unit.code} — ${unit.name}"?${count > 0 ? `\n\nThis will also delete ${count} resource(s).` : ''}`
    )) return

    const response = await fetch('/api/admin/units', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: unit.id }),
    })

    if (!response.ok) {
      const result = await response.json()
      alert(result.error || 'Delete failed')
      return
    }

    setUnits((prev) => prev.filter((u) => u.id !== unit.id))
  }

  const inputCls = "w-full px-3 py-2.5 text-sm bg-[#0F172A] border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] transition-all"
  const labelCls = "text-sm font-semibold text-slate-300"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">All units</h2>
          <p className="text-sm text-slate-500 mt-0.5">University of Nairobi</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-[#1E3A8A]/90 transition-all"
        >
          <Plus size={15} />
          Add unit
        </button>
      </div>

      {/* Add unit form */}
      {showForm && (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-white">New unit</h3>
            <button
              onClick={() => { setShowForm(false); setError('') }}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Unit code *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SMA 3104"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Unit name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Calculus II"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>Programme</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelCls}>Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className={inputCls}>
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5].map((y) => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Semester</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className={inputCls}>
                  <option value="">Any</option>
                  <option value="1">Sem 1</option>
                  <option value="2">Sem 2</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="sm:col-span-2 text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <div className="sm:col-span-2">
              <button
                onClick={handleAdd}
                disabled={!code.trim() || !name.trim() || saving}
                className="w-full py-3 bg-[#1E3A8A] text-white rounded-xl font-semibold text-sm hover:bg-[#1E3A8A]/90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {saving
                  ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  : 'Add unit'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Units table */}
      {units.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <GraduationCap size={36} className="mx-auto mb-3 text-slate-700" />
          <p className="text-sm">No units yet. Add the first one above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Code', 'Name', 'Programme', 'Year / Sem', 'Resources', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {units.map((unit) => (
                <tr key={unit.id} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-[#1E3A8A]/20 text-blue-300 text-xs font-bold rounded-full">
                      {unit.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-white font-medium">{unit.name}</td>
                  <td className="py-3.5 px-4 text-slate-400">{unit.department ?? '—'}</td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {unit.year ? `Y${unit.year}` : '—'}{unit.semester ? ` / S${unit.semester}` : ''}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {resourceCount[unit.id] || 0}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(unit)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Resources Tab ────────────────────────────────────────────────────────────

function ResourcesTab({
  units,
  resources,
  setResources,
}: {
  units: Unit[]
  resources: (Resource & { unit?: { code: string; name: string } | null })[]
  setResources: React.Dispatch<React.SetStateAction<any[]>>
}) {
  const [showForm, setShowForm] = useState(false)
  const [unitId, setUnitId] = useState('')
  const [unitQuery, setUnitQuery] = useState('')
  const [title, setTitle] = useState('')
  const [resourceType, setResourceType] = useState<ResourceType>('Notes')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedUnit = units.find((u) => u.id === unitId)

  const unitMatches = units.filter((u) => {
    const q = unitQuery.toLowerCase().trim()
    if (!q) return true
    return (
      u.code.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    )
  })

  const handleUnitQueryChange = (value: string) => {
    setUnitQuery(value)
    const exact = units.find((u) => value === u.code || value === `${u.code} — ${u.name}`)
    setUnitId(exact?.id ?? '')
  }

  const handleUpload = async () => {
    if (!unitId || !title.trim() || !file) return
    setUploading(true)
    setError('')

    try {
      const supabase = createClient()

      // 1. Upload file directly from browser to Supabase Storage
      const ext = file.name.split('.').pop() || 'pdf'
      const filePath = `${unitId}/${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('unit-vault-materials')
        .upload(filePath, file, {
          contentType: file.type || 'application/pdf',
          upsert: false,
        })

      if (uploadErr) {
        throw new Error(`Storage upload failed: ${uploadErr.message}`)
      }

      // 2. Retrieve public URL
      const { data: publicUrlData } = supabase.storage
        .from('unit-vault-materials')
        .getPublicUrl(filePath)

      // 3. Post metadata JSON to the API route
      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId,
          title: title.trim(),
          resourceType,
          fileUrl: publicUrlData.publicUrl,
          filePath,
        }),
      })

      if (!response.ok) {
        const resultText = await response.text()
        let errorMessage = 'Upload failed'
        try {
          const parsed = JSON.parse(resultText)
          errorMessage = parsed.error || errorMessage
        } catch {
          errorMessage = resultText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      setResources((prev) => [{ ...result.resource, unit: selectedUnit }, ...prev])
      setUploadSuccess(true)
      setUnitId(''); setUnitQuery(''); setTitle(''); setFile(null)
      setTimeout(() => { setUploadSuccess(false); setShowForm(false) }, 2000)
    } catch (err: any) {
      setError(err.message || 'Upload failed. Check your storage bucket.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (resource: Resource) => {
    if (!confirm(`Delete "${resource.title}"? This cannot be undone.`)) return

    const response = await fetch('/api/admin/resources', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: resource.id }),
    })

    if (!response.ok) {
      const result = await response.json()
      alert(result.error || 'Delete failed')
      return
    }

    setResources((prev) => prev.filter((r) => r.id !== resource.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#FFFFFF]">All resources</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {resources.length} resource{resources.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-[#1E3A8A]/90 transition-all"
        >
          <Upload size={15} />
          Upload resource
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-white">Upload new resource</h3>
            <button
              onClick={() => { setShowForm(false); setError('') }}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {uploadSuccess ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <CheckCircle size={24} className="text-[#059669]" />
              <span className="text-white font-semibold">Resource uploaded successfully!</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Unit search */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300">Unit</label>
                <input
                  type="text"
                  list="unit-options"
                  value={unitQuery}
                  onChange={(e) => handleUnitQueryChange(e.target.value)}
                  placeholder="Type a unit code or name..."
                  className="w-full px-3 py-2.5 text-sm bg-[#0F172A] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] transition-all"
                />
                <datalist id="unit-options">
                  {unitMatches.map((u) => (
                    <option key={u.id} value={`${u.code} — ${u.name}`} />
                  ))}
                </datalist>
                {selectedUnit && (
                  <p className="text-xs text-[#059669] font-medium">
                    ✓ {selectedUnit.code} — {selectedUnit.name}
                  </p>
                )}
              </div>

              {/* Type toggle */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-300">Type</label>
                <div className="flex gap-2">
                  {(['Notes', 'Past Paper'] as ResourceType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setResourceType(t)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                        resourceType === t
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                          : 'bg-[#0F172A] text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-300">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CAT 1 Past Paper 2025, Chapter 3 Notes"
                  className="w-full px-3 py-2.5 text-sm bg-[#0F172A] border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] transition-all"
                />
              </div>

              {/* File drop zone */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm font-semibold text-slate-300">PDF File</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const f = e.dataTransfer.files[0]
                    if (f?.type === 'application/pdf') setFile(f)
                  }}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#1E3A8A] bg-[#1E3A8A]/10'
                      : file
                      ? 'border-[#059669]/50 bg-[#059669]/5'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  />
                  {file ? (
                    <div>
                      <FileText size={28} className="mx-auto text-[#059669] mb-2" />
                      <p className="text-[#059669] font-semibold text-sm">{file.name}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload size={28} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-slate-400 text-sm font-medium">
                        Drop PDF here or click to browse
                      </p>
                      <p className="text-slate-600 text-xs mt-1">Max 50MB</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="sm:col-span-2 text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2.5">
                  {error}
                </div>
              )}

              <div className="sm:col-span-2">
                <button
                  onClick={handleUpload}
                  disabled={!unitId || !title.trim() || !file || uploading}
                  className="w-full py-3 bg-[#1E3A8A] text-white rounded-xl font-semibold text-sm hover:bg-[#1E3A8A]/90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  {uploading
                    ? <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                    : 'Upload to vault'
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resources table */}
      {resources.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <Upload size={36} className="mx-auto mb-3 text-slate-700" />
          <p className="text-sm">No resources yet. Upload the first one above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Title', 'Unit', 'Type', 'Uploaded', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {resources.map((r) => (
                <tr key={r.id} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <a
                      href={r.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-[#93C5FD] font-medium transition-colors line-clamp-1"
                    >
                      {r.title}
                    </a>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-[#1E3A8A]/20 text-blue-300 text-xs font-semibold rounded-full">
                      {r.unit?.code ?? '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      r.resource_type === 'Notes'
                        ? 'bg-blue-950/50 text-blue-400'
                        : 'bg-emerald-950/50 text-emerald-400'
                    }`}>
                      {r.resource_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(r.created_at)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(r)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}