import { useState, useEffect } from 'react'
import type { Resource, LeaderboardEntry, Subject } from '@/types'
import { INITIAL_RESOURCES, MOCK_LEADERBOARD, MOCK_SUBJECTS } from '@/data/mockData'
import { getBookmarks, getDownloads } from '@/lib/bookmarks'

const UPLOADS_STORAGE_KEY = 'syncnote_custom_uploads'
const CREDITS_STORAGE_KEY = 'syncnote_user_credits'
const PLATFORM_DOWNLOADS_KEY = 'syncnote_platform_downloads'

// ─── Credits Store ────────────────────────────────────────────────────────────
export function getUserCredits(): number {
  try {
    const raw = localStorage.getItem(CREDITS_STORAGE_KEY)
    if (raw !== null) {
      const val = parseInt(raw, 10)
      if (!isNaN(val)) {
        // Automatically migrate legacy mock values (1420 base)
        if (val === 1420) {
          const actualCredits = getCustomUploads().length * 150
          localStorage.setItem(CREDITS_STORAGE_KEY, actualCredits.toString())
          return actualCredits
        }
        if (val >= 1420 && (val - 1420) % 150 === 0) {
          const actualCredits = val - 1420
          localStorage.setItem(CREDITS_STORAGE_KEY, actualCredits.toString())
          return actualCredits
        }
        return val
      }
    }
    // Default starting credits based on real uploads (150 per note uploaded, or 0)
    const initialCredits = getCustomUploads().length * 150
    localStorage.setItem(CREDITS_STORAGE_KEY, initialCredits.toString())
    return initialCredits
  } catch {
    return getCustomUploads().length * 150
  }
}

export function addCredits(amount: number): number {
  try {
    const current = getUserCredits()
    const next = current + amount
    localStorage.setItem(CREDITS_STORAGE_KEY, next.toString())
    window.dispatchEvent(new Event('syncnote:credits_changed'))
    return next
  } catch {
    return getUserCredits()
  }
}

export function deductCredits(amount: number): boolean {
  try {
    const current = getUserCredits()
    if (current < amount) return false
    const next = current - amount
    localStorage.setItem(CREDITS_STORAGE_KEY, next.toString())
    window.dispatchEvent(new Event('syncnote:credits_changed'))
    return true
  } catch {
    return false
  }
}

// ─── Resources Store ──────────────────────────────────────────────────────────
export function getCustomUploads(): Resource[] {
  try {
    const raw = localStorage.getItem(UPLOADS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((r: any) => {
      if (!r.subject || !r.subject.name) {
        const subName = r.subject_name || r.title || 'General Subject'
        return {
          ...r,
          subject: {
            id: r.subject_id || 'subj_' + String(subName).toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name: subName,
            subject_code: r.subject_code || '',
            branch: r.branch || 'B.Tech CSE/IT',
            semester: r.semester || 1,
            description: r.description || `Study material for ${subName}`,
            created_at: r.created_at || new Date().toISOString(),
          }
        }
      }
      return r
    })
  } catch {
    return []
  }
}

export function getAllResources(): Resource[] {
  const custom = getCustomUploads()
  return [...custom, ...INITIAL_RESOURCES]
}

export function saveCustomUpload(resource: Resource): void {
  try {
    const current = getCustomUploads()
    current.unshift(resource)
    localStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(current))
    // Award +150 credits for sharing notes
    addCredits(150)
    window.dispatchEvent(new Event('syncnote:resources_changed'))
  } catch (err) {
    console.error('Failed to save upload', err)
  }
}

export function deleteCustomUpload(identifier: string): boolean {
  try {
    const raw = localStorage.getItem(UPLOADS_STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return false
    const q = identifier.trim().toLowerCase()
    const updated = parsed.filter((r: any) => {
      const matchId = r.id && (r.id === identifier || r.id.toLowerCase() === q)
      const matchTitle = r.title && r.title.trim().toLowerCase() === q
      return !matchId && !matchTitle
    })
    localStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(updated))
    // Recalculate credits to match remaining uploads
    const remainingCredits = updated.length * 150
    localStorage.setItem(CREDITS_STORAGE_KEY, remainingCredits.toString())
    window.dispatchEvent(new Event('syncnote:resources_changed'))
    window.dispatchEvent(new Event('syncnote:credits_changed'))
    return true
  } catch (err) {
    console.error('Failed to delete upload', err)
    return false
  }
}

export function incrementResourceDownload(resourceId: string): void {
  try {
    // Increment in custom uploads if it's there
    const custom = getCustomUploads()
    const match = custom.find(r => r.id === resourceId)
    if (match) {
      match.download_count = (match.download_count || 0) + 1
      localStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(custom))
    }
    // Track total downloads
    const currentPlatform = getPlatformDownloadsCount()
    localStorage.setItem(PLATFORM_DOWNLOADS_KEY, (currentPlatform + 1).toString())
    window.dispatchEvent(new Event('syncnote:resources_changed'))
  } catch (err) {
    console.error('Failed to increment download count', err)
  }
}

export function getPlatformDownloadsCount(): number {
  try {
    const realDownloads = getDownloads().length
    const raw = localStorage.getItem(PLATFORM_DOWNLOADS_KEY)
    if (raw !== null) {
      const val = parseInt(raw, 10)
      if (!isNaN(val)) {
        // If legacy mock count or if user has 0 downloads, keep it clean and synced
        if (val >= 48250 || realDownloads === 0) {
          localStorage.setItem(PLATFORM_DOWNLOADS_KEY, realDownloads.toString())
          return realDownloads
        }
        return Math.max(val, realDownloads)
      }
    }
    localStorage.setItem(PLATFORM_DOWNLOADS_KEY, realDownloads.toString())
    return realDownloads
  } catch {
    return getDownloads().length
  }
}

// ─── Dynamic Leaderboard ──────────────────────────────────────────────────────
export function getLiveLeaderboard(currentUserProfile?: { full_name?: string; course_branch?: string } | null): LeaderboardEntry[] {
  const credits = getUserCredits()
  const customUploads = getCustomUploads()
  const userUploads = customUploads.length
  const userDownloads = customUploads.reduce((sum, r) => sum + (r.download_count || 0), 0)

  const entries: LeaderboardEntry[] = MOCK_LEADERBOARD.map(entry => {
    if (entry.is_current_user) {
      return {
        ...entry,
        display_name: currentUserProfile?.full_name ? `${currentUserProfile.full_name} (You)` : 'You',
        branch: currentUserProfile?.course_branch || entry.branch,
        sync_credits: credits,
        approved_uploads: userUploads,
        total_downloads: userDownloads,
        badge: userUploads >= 10 ? '🏆 Top Contributor' : userUploads >= 5 ? '⭐ Star Contributor' : userUploads >= 1 ? '📝 Contributor' : '🌱 Newcomer',
      }
    }
    return entry
  })

  // Sort dynamically by sync_credits descending
  entries.sort((a, b) => b.sync_credits - a.sync_credits)
  return entries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }))
}

// ─── Dynamic Subjects Store ───────────────────────────────────────────────────
export function getAllSubjects(): Subject[] {
  const custom = getCustomUploads()
  const subjects: Subject[] = []
  const seen = new Set<string>()

  for (const r of custom) {
    if (r.subject && r.subject.name && !seen.has(r.subject.name.toLowerCase().trim())) {
      seen.add(r.subject.name.toLowerCase().trim())
      subjects.push(r.subject)
    }
  }
  return [...MOCK_SUBJECTS, ...subjects]
}

export function getSubjectCountForSemester(semester: number): number {
  return getAllSubjects().filter(s => s.semester === semester).length
}

// ─── React Hook for Live Data ─────────────────────────────────────────────────
export function useLiveSyncNoteData() {
  const [resources, setResources] = useState<Resource[]>(() => getAllResources())
  const [credits, setCredits] = useState<number>(() => getUserCredits())
  const [bookmarks, setBookmarks] = useState<string[]>(() => getBookmarks())
  const [downloads, setDownloads] = useState<string[]>(() => getDownloads())
  const [platformDownloads, setPlatformDownloads] = useState<number>(() => getPlatformDownloadsCount())

  useEffect(() => {
    function handleResources() {
      setResources(getAllResources())
      setPlatformDownloads(getPlatformDownloadsCount())
    }
    function handleCredits() {
      setCredits(getUserCredits())
    }
    function handleBookmarks() {
      setBookmarks(getBookmarks())
    }
    function handleDownloads() {
      setDownloads(getDownloads())
      setPlatformDownloads(getPlatformDownloadsCount())
    }

    window.addEventListener('syncnote:resources_changed', handleResources)
    window.addEventListener('syncnote:credits_changed', handleCredits)
    window.addEventListener('syncnote:bookmarks_changed', handleBookmarks)
    window.addEventListener('syncnote:downloads_changed', handleDownloads)
    window.addEventListener('storage', handleResources)

    return () => {
      window.removeEventListener('syncnote:resources_changed', handleResources)
      window.removeEventListener('syncnote:credits_changed', handleCredits)
      window.removeEventListener('syncnote:bookmarks_changed', handleBookmarks)
      window.removeEventListener('syncnote:downloads_changed', handleDownloads)
      window.removeEventListener('storage', handleResources)
    }
  }, [])

  const customUploads = getCustomUploads()
  const totalMaterials = getAllResources().length
  const myUploadsCount = customUploads.length

  return {
    resources,
    credits,
    bookmarks,
    downloads,
    platformDownloads,
    totalMaterials,
    myUploadsCount,
  }
}
