// @ts-nocheck
'use client'

import { FileText, BookOpen, Download, Bookmark, Trash2, Eye, X } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { Resource } from '@/lib/supabase/types'
import type { User } from '@supabase/supabase-js'

interface ResourceCardProps {
  resource: Resource
  user: User | null
  isSaved?: boolean
  showDelete?: boolean
  onUnsave?: (resourceId: string) => void
  onAuthRequired?: () => void
}

export function ResourceCard({
  resource,
  user,
  isSaved = false,
  showDelete = false,
  onUnsave,
  onAuthRequired,
}: ResourceCardProps) {
  const supabase = createClient()
  const [saved, setSaved] = useState(isSaved)
  const [loading, setLoading] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const isNotes = resource.resource_type === 'Notes'

  const handleToggleSave = async () => {
    if (!user) {
      onAuthRequired?.()
      return
    }
    setLoading(true)
    if (saved) {
      await supabase
        .from('saved_resources')
        .delete()
        .eq('user_id', user.id)
        .eq('resource_id', resource.id)
      setSaved(false)
      onUnsave?.(resource.id)
    } else {
      await supabase
        .from('saved_resources')
        .insert({ user_id: user.id, resource_id: resource.id })
      setSaved(true)
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

          {showDelete ? (
            <form action={`/api/resources/${resource.id}`} method="POST">
              <button
                type="submit"
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                title="Delete resource"
              >
                <Trash2 size={15} />
              </button>
            </form>
          ) : (
            <button
              onClick={handleToggleSave}
              disabled={loading}
              className={`p-1.5 rounded-lg transition-all ${
                saved
                  ? 'text-[#1E3A8A] bg-[#EFF6FF]'
                  : 'text-slate-300 hover:text-[#1E3A8A] hover:bg-[#EFF6FF] opacity-0 group-hover:opacity-100'
              }`}
              title={saved ? 'Remove from vault' : 'Save to vault'}
            >
              <Bookmark size={16} fill={saved ? '#1E3A8A' : 'none'} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-semibold text-[#0F172A] text-base leading-snug mb-1.5 line-clamp-2">
            {resource.title}
          </h3>
          {resource.course && (
            <p className="text-[#64748B] text-sm font-medium">
              {resource.course.code}
              <span className="text-slate-300 mx-1.5">•</span>
              {resource.course.name}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-2">
          <div>
            {resource.uploader_name && (
              <div className="text-xs text-[#64748B] font-medium">{resource.uploader_name}</div>
            )}
            <div className="text-xs text-slate-400 mt-0.5">{formatDate(resource.created_at)}</div>
          </div>

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