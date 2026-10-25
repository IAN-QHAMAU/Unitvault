'use client'

import { FileText, BookOpen, Download, Bookmark, Eye, X } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { Resource } from '@/lib/supabase/types'
import type { User } from '@supabase/supabase-js'

interface ResourceCardProps {
  resource: Resource
  user: User | null
  isSaved?: boolean
  // Show the unit code and name, for lists that mix units (My Vault)
  showUnit?: boolean
  onUnsave?: (resourceId: string) => void
  onAuthRequired?: () => void
}

export function ResourceCard({
  resource,
  user,
  isSaved = false,
  showUnit = false,
  onUnsave,
  onAuthRequired,
}: ResourceCardProps) {
  const supabase = createClient()
  const [saved, setSaved] = useState(isSaved)
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const isNotes = resource.resource_type === 'Notes'

  const handleToggleSave = async () => {
    if (!user) {
      onAuthRequired?.()
      return
    }
    setLoading(true)
    setSaveError('')
    if (saved) {
      const { error } = await supabase
        .from('saved_resources')
        .delete()
        .eq('user_id', user.id)
        .eq('resource_id', resource.id)
      if (error) {
        setSaveError("Couldn't remove it. Try again.")
      } else {
        setSaved(false)
        onUnsave?.(resource.id)
      }
    } else {
      // The hand-written Database type makes inserts resolve to `never` until
      // it's regenerated with `supabase gen types`
      const { error } = await supabase
        .from('saved_resources')
        .insert({ user_id: user.id, resource_id: resource.id } as never)
      // 23505: already saved, e.g. from another tab
      if (error && error.code !== '23505') {
        setSaveError("Couldn't save it. Try again.")
      } else {
        setSaved(true)
      }
    }
    setLoading(false)
  }

  // Use Google Docs viewer on mobile, native browser viewer on desktop
  const previewSrc =
    typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)
      ? `https://docs.google.com/viewer?url=${encodeURIComponent(resource.file_url)}&embedded=true`
      : `${resource.file_url}#toolbar=1&navpanes=0`

  return (
    <>
      <div className="group bg-white border border-[#E2E8F0] rounded-xl p-5 hover:border-[#1E3A8A]/30 hover:shadow-md transition-all duration-200 flex flex-col gap-4">

        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isNotes
                ? 'bg-[#EFF6FF] text-[#1E3A8A]'
                : 'bg-emerald-50 text-[#059669]'
            }`}
          >
            {isNotes ? <BookOpen size={11} /> : <FileText size={11} />}
            {resource.resource_type}
          </span>

          {/* Hover-to-reveal only where there is a mouse; phones always see it */}
          <button
            onClick={handleToggleSave}
            disabled={loading}
            className={`p-1.5 rounded-lg transition-all ${
              saved
                ? 'text-[#1E3A8A] bg-[#EFF6FF]'
                : 'text-slate-400 hover:text-[#1E3A8A] hover:bg-[#EFF6FF] pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 focus-visible:opacity-100'
            }`}
            title={saved ? 'Remove from vault' : 'Save to vault'}
            aria-label={saved ? 'Remove from vault' : 'Save to vault'}
            aria-pressed={saved}
          >
            <Bookmark size={16} fill={saved ? '#1E3A8A' : 'none'} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-semibold text-[#0F172A] text-base leading-snug mb-1.5 line-clamp-2">
            {resource.title}
          </h3>
          {showUnit && resource.unit && (
            <p className="text-[#64748B] text-sm font-medium">
              {resource.unit.code}
              <span className="text-slate-300 mx-1.5">•</span>
              {resource.unit.name}
            </p>
          )}
          {saveError && (
            <p className="text-xs text-red-600 mt-1.5" role="alert">{saveError}</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-2">
          <div className="text-xs text-slate-400">{formatDate(resource.created_at)}</div>

          <div className="flex items-center gap-2">
            {/* Preview */}
            <button
              onClick={() => setPreviewing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] text-[#64748B] rounded-lg text-xs font-semibold hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A] hover:bg-[#EFF6FF] transition-all"
            >
              <Eye size={13} />
              Preview
            </button>

            {/* Download */}
            <a
              href={resource.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] text-white rounded-lg text-xs font-semibold hover:bg-[#059669]/90 active:scale-[0.97] transition-all"
            >
              <Download size={13} />
              Download
            </a>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewing && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-sm">

          {/* Modal header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E2E8F0] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isNotes ? 'bg-[#EFF6FF]' : 'bg-emerald-50'}`}>
                {isNotes
                  ? <BookOpen size={14} className="text-[#1E3A8A]" />
                  : <FileText size={14} className="text-[#059669]" />
                }
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[#0F172A] text-sm truncate">{resource.title}</div>
                <div className="text-xs text-[#64748B]">{resource.resource_type}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">
              <a
                href={resource.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] text-white rounded-lg text-xs font-semibold hover:bg-[#059669]/90 transition-all"
              >
                <Download size={13} />
                Download
              </a>
              <button
                onClick={() => setPreviewing(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* PDF viewer */}
          <div className="flex-1 bg-slate-800">
            <iframe
              src={previewSrc}
              className="w-full h-full border-0"
              title={resource.title}
            />
          </div>
        </div>
      )}
    </>
  )
}