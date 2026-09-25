import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client.js'

const STAGES = [
  'Extracting text and layout',
  'Running OCR (if needed)',
  'Classifying content elements',
  'Detecting accessibility issues',
  'Building semantic representation',
]

export default function Processing() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [stageNote, setStageNote] = useState('Starting analysis…')

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        // If already analyzed, skip straight to results (no error).
        const existing = await api.getDocument(documentId)
        if (cancelled) return
        const status = existing?.status
        if (status && status !== 'uploaded' && status !== 'failed') {
          setStageNote('Already analyzed — opening results…')
          navigate(`/documents/${documentId}/analysis`, { replace: true })
          return
        }

        setStageNote('Running extraction and analysis…')
        await api.analyzeDocument(documentId)
        if (!cancelled) navigate(`/documents/${documentId}/analysis`, { replace: true })
      } catch (err) {
        if (cancelled) return
        const msg = err?.message || String(err)
        // Backend used to 409 on re-analyze; still treat that as success.
        if (/already/i.test(msg) && /analy/i.test(msg)) {
          navigate(`/documents/${documentId}/analysis`, { replace: true })
          return
        }
        setError(msg)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [documentId, navigate])

  return (
    <div className="max-w-lg mx-auto text-center" aria-live="polite">
      <h1 className="text-xl font-semibold mb-2">Analyzing your document…</h1>
      <p className="text-sm text-gray-500 mb-6">{stageNote}</p>
      <ol className="text-left space-y-2 inline-block">
        {STAGES.map((stage) => (
          <li key={stage} className="text-gray-600 text-sm">
            {stage}
          </li>
        ))}
      </ol>
      {error && (
        <div className="mt-6 space-y-3">
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
          <div className="flex gap-3 justify-center text-sm">
            <Link
              to={`/documents/${documentId}/analysis`}
              className="text-brand-600 hover:underline"
            >
              Open analysis anyway
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:underline">
              Back to dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
