import { Link } from 'react-router-dom'
import { Calendar, Download, ExternalLink, ChevronRight } from 'lucide-react'
import { MOCK_EVENTS } from '@/data/mockData'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const OFFICIAL_CALENDAR_PDF_URL = 'https://ggu.ac.in/media/notices/academic-calendar/Engg_Tech_Academic_Calendar_17.9.26.pdf'

const EVENT_COLORS: Record<string, { bg: string; dot: string; badge: string }> = {
  exam: { bg: 'hover:bg-red-50', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200' },
  holiday: { bg: 'hover:bg-green-50', dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 border-green-200' },
  registration: { bg: 'hover:bg-blue-50', dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  academic: { bg: 'hover:bg-violet-50', dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
}

const MONTHS = [
  { month: 'July 2024', events: [{ date: '1 Jul', title: 'Semester Begins', cat: 'academic' }, { date: '15 Jul', title: 'Course Registration Opens', cat: 'registration' }] },
  { month: 'August 2024', events: [{ date: '5 Aug', title: 'Independence Day Holiday', cat: 'holiday' }, { date: '26 Aug', title: 'Registration Deadline', cat: 'registration' }] },
  { month: 'September 2024', events: [{ date: '5 Sep', title: 'Teachers\' Day', cat: 'academic' }, { date: '23 Sep', title: 'Annual Sports Week Begins', cat: 'academic' }] },
  { month: 'October 2024', events: [{ date: '2 Oct', title: 'Gandhi Jayanti Holiday', cat: 'holiday' }, { date: '14 Oct', title: 'Mid-Semester Exams Begin', cat: 'exam' }] },
  { month: 'November 2024', events: [{ date: '1 Nov', title: 'Diwali Holidays (3 days)', cat: 'holiday' }, { date: '22 Nov', title: 'Annual Tech Fest', cat: 'academic' }] },
  { month: 'December 2024', events: [{ date: '2 Dec', title: 'End-Semester Exams Begin', cat: 'exam' }, { date: '25 Dec', title: 'Christmas Holiday', cat: 'holiday' }] },
]

export default function AcademicCalendar() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <nav className="text-xs text-slate-400 mb-2 flex items-center gap-1">
          <Link to="/dashboard" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <span className="text-slate-700">Academic Calendar</span>
        </nav>
        <h1 className="text-2xl font-bold text-slate-800">Academic Calendar 2024-25</h1>
        <p className="text-sm text-slate-500 mt-1">Official academic schedule, events, and important dates.</p>
      </div>

      {/* Info Banner */}
      <div className="card p-5 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-100">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <Calendar size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-slate-800">School of Studies in Engineering &amp; Technology</h2>
            <p className="text-sm text-slate-600 mt-0.5">Official Academic Calendar · Guru Ghasidas Vishwavidyalaya</p>
            <p className="text-xs text-slate-500 mt-1">Engg_Tech_Academic_Calendar_17.9.26.pdf</p>
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <a
              href={OFFICIAL_CALENDAR_PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <Download size={14} /> Download Official PDF
            </a>
            <a
              href={OFFICIAL_CALENDAR_PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
            >
              <ExternalLink size={14} /> Open Notice PDF
            </a>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(EVENT_COLORS).map(([cat, col]) => (
          <span key={cat} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
            <span className="capitalize text-slate-600">{cat}</span>
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MONTHS.map(({ month, events }) => (
          <div key={month} className="card overflow-hidden">
            <div className="px-4 py-3 bg-teal-600 text-white font-semibold text-sm">{month}</div>
            <div className="divide-y divide-slate-50">
              {events.map((ev, i) => {
                const col = EVENT_COLORS[ev.cat] ?? EVENT_COLORS.academic
                return (
                  <div key={i} className={`flex items-center gap-3 px-4 py-3 transition-colors ${col.bg}`}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />
                    <span className="text-xs font-semibold text-slate-500 w-14 flex-shrink-0">{ev.date}</span>
                    <span className="text-sm text-slate-700 flex-1">{ev.title}</span>
                    <span className={`badge border text-[10px] flex-shrink-0 ${col.badge}`}>{ev.cat}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Events List */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-teal-500" /> Upcoming Events
        </h2>
        <div className="space-y-3">
          {MOCK_EVENTS.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()).map(ev => {
            const col = EVENT_COLORS[ev.category] ?? EVENT_COLORS.academic
            return (
              <div key={ev.id} className={`card p-4 flex items-center gap-4 transition-all hover:shadow-md ${col.bg}`}>
                <div className={`w-12 h-12 rounded-xl ${col.dot.replace('bg-', 'bg-opacity-10 bg-')} flex items-center justify-center flex-shrink-0 text-center`}>
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">{new Date(ev.event_date).toLocaleString('en', { month: 'short' })}</p>
                    <p className="text-lg font-bold text-slate-800 leading-none">{new Date(ev.event_date).getDate()}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{ev.title}</p>
                  {ev.description && <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`badge border text-[10px] ${col.badge}`}>{ev.category}</span>
                    <span className="text-xs text-slate-400">{formatDate(ev.event_date)}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
