import Link from 'next/link'
import { FileText, ChevronRight } from 'lucide-react'
import type { Unit } from '@/lib/supabase/types'

interface CourseCardProps {
  course: Unit
  resourceCount?: number
}

export function CourseCard({ course, resourceCount = 0 }: CourseCardProps) {
  return (
    <Link
      href={`/vault/${encodeURIComponent(course.code)}`}
      className="group block bg-white border border-[#E2E8F0] rounded-xl p-5 hover:border-[#1E3A8A]/40 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Course code pill */}
          <span className="inline-block px-2.5 py-0.5 bg-[#EFF6FF] text-[#1E3A8A] text-xs font-bold rounded-full mb-2">
            {course.code}
          </span>

          <h3 className="font-semibold text-[#0F172A] text-base leading-snug truncate">
            {course.name}
          </h3>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {course.department && (
              <span className="text-xs text-[#64748B]">{course.department}</span>
            )}
            {course.year && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-[#64748B]">Year {course.year}</span>
              </>
            )}
            {course.semester && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-[#64748B]">Sem {course.semester}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <ChevronRight
            size={18}
            className="text-slate-300 group-hover:text-[#1E3A8A] transition-colors mt-0.5"
          />
          {resourceCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#64748B]">
              <FileText size={11} />
              {resourceCount}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
