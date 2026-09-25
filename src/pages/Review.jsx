import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'

const DECISIONS = [
  {
    value: 'accepted',
    label: 'Accept as-is',
    description: 'Approve the transformed output; warnings acknowledged.',
  },
  {
    value: 'overridden',
    label: 'Override warnings',
    description: 'Approve after overriding specific warnings (record notes).',
  },
  {
    value: 'rejected',
    label: 'Reject',
    description: 'Do not release; requires re-transform or content fix.',
  },
]

const severityClass = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-900 border-amber-200',
  low: 'bg-blue-50 text-blue-800 border-blue-200',
  informational: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function Review() {
  const [queue, setQueue] = useState([])
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [version, setVersion] = useState(null)
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [reviewerName, setReviewerName] = useState('reviewer')
  const [notes, setNotes] = useState('')
  const [decision, setDecision] = useState('accepted')
  const [resolutions, setResolutions] = useState({}) // warningId -> action
  const [statusMsg, setStatusMsg] = useState(null)

  const loadQueue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const items = await api.listReviewQueue()
      setQueue(items || [])
      if (items?.length && !selected) {
        // auto-select first pending
      }
    } catch (err) {
      setError(err.message || 'Failed to load review queue')
    } finally {
      setLoading(false)
    }
  }, [selected])

  useEffect(() => {
    loadQueue()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function selectItem(item) {
    setSelected(item)
    setNotes('')
    setDecision('accepted')
    setResolutions({})
    setStatusMsg(null)
    setVersion(null)
    setDocument(null)
    try {
      const [doc, versions] = await Promise.all([
        api.getDocument(item.document_id),
        api.listVersions(item.document_id),
      ])
      setDocument(doc)
      const match = (versions || []).find((v) => v.id === item.transformed_version_id)
      setVersion(match || null)
    } catch (err) {
      setError(err.message || 'Failed to load review context')
    }
  }

  function setWarningAction(warningId, action) {
    setResolutions((prev) => ({ ...prev, [warningId]: action }))
  }

  async function submitReview(e) {
    e.preventDefault()
    if (!selected) return
    setSubmitting(true)
    setStatusMsg(null)
    setError(null)
    try {
      const warning_resolutions = (selected.warnings || []).map((w) => ({
        warning_id: w.id,
        action: resolutions[w.id] || (decision === 'rejected' ? 'dismiss' : 'accept'),
        note: null,
      }))
      const updated = await api.submitReview(selected.document_id, selected.id, {
        decision,
        reviewer_name: reviewerName || 'reviewer',
        notes: notes || null,
        warning_resolutions,
      })
      setHistory((h) => [updated, ...h])
      setQueue((q) => q.filter((x) => x.id !== selected.id))
      setSelected(null)
      setVersion(null)
      setDocument(null)
      setStatusMsg(`Recorded decision: ${decision}`)
    } catch (err) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Human review queue</h1>
        <p className="text-gray-600 max-w-3xl">
          Validation results flagged <code className="text-sm bg-gray-100 px-1 rounded">requires_human_review</code>.
          Review the original → transformation → validation chain, accept or override warnings, and
          record an audit decision.
        </p>
      </header>

      {error && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 text-red-800 px-4 py-3">
          {error}
        </div>
      )}
      {statusMsg && (
        <div role="status" className="rounded border border-green-200 bg-green-50 text-green-800 px-4 py-3">
          {statusMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Queue list */}
        <section aria-labelledby="queue-heading" className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="queue-heading" className="font-medium text-gray-900">
              Pending ({queue.length})
            </h2>
            <button
              type="button"
              onClick={loadQueue}
              className="text-sm text-brand-600 hover:underline"
            >
              Refresh
            </button>
          </div>
          {loading && <p className="text-sm text-gray-500">Loading…</p>}
          {!loading && queue.length === 0 && (
            <p className="text-sm text-gray-500 border rounded-lg p-4 bg-white">
              No items need review. Run validate on a transformed document to populate this queue.
            </p>
          )}
          <ul className="space-y-2">
            {queue.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => selectItem(item)}
                  className={`w-full text-left rounded-lg border px-3 py-3 transition ${
                    selected?.id === item.id
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                      : 'border-gray-200 bg-white hover:border-brand-300'
                  }`}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-medium text-sm truncate">{item.document_id}</span>
                    <span className="text-sm tabular-nums text-gray-700">
                      {Number(item.overall_consistency_score).toFixed(0)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(item.warnings || []).length} warning(s) · version {item.transformed_version_id}
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {history.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Session decisions</h3>
              <ul className="text-xs space-y-1 text-gray-600">
                {history.map((h) => (
                  <li key={h.id}>
                    {h.id.slice(0, 8)}… → <strong>{h.reviewer_decision}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Detail + action */}
        <section aria-labelledby="detail-heading" className="lg:col-span-2 space-y-4">
          {!selected && (
            <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 bg-white">
              Select a validation result from the queue to review the audit trail.
            </div>
          )}

          {selected && (
            <>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <h2 id="detail-heading" className="font-semibold text-gray-900">
                  Audit trail
                </h2>
                <ol className="grid sm:grid-cols-4 gap-2 text-sm">
                  <li className="rounded bg-gray-50 border px-3 py-2">
                    <div className="text-xs uppercase text-gray-500">1. Original</div>
                    <div className="font-medium truncate">
                      {document?.source_filename || selected.document_id}
                    </div>
                    <Link
                      className="text-brand-600 text-xs hover:underline"
                      to={`/documents/${selected.document_id}/analysis`}
                    >
                      Open analysis
                    </Link>
                  </li>
                  <li className="rounded bg-gray-50 border px-3 py-2">
                    <div className="text-xs uppercase text-gray-500">2. Transformation</div>
                    <div className="font-medium">
                      {version?.format || selected.transformed_version_id}
                    </div>
                    <div className="text-xs text-gray-500">
                      conf {version?.generation_confidence ?? '—'}
                    </div>
                  </li>
                  <li className="rounded bg-gray-50 border px-3 py-2">
                    <div className="text-xs uppercase text-gray-500">3. Validation</div>
                    <div className="font-medium">
                      Score {Number(selected.overall_consistency_score).toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(selected.warnings || []).length} warnings
                    </div>
                  </li>
                  <li className="rounded bg-amber-50 border border-amber-200 px-3 py-2">
                    <div className="text-xs uppercase text-amber-700">4. Your decision</div>
                    <div className="font-medium text-amber-900">Pending</div>
                  </li>
                </ol>
              </div>

              {/* Checks summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Preservation checks</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  {[
                    ['Concepts', selected.concepts],
                    ['Relationships', selected.relationships],
                    ['Numerical', selected.numerical],
                    ['Negation', selected.negation],
                  ].map(([label, check]) => (
                    <div key={label} className="rounded border px-3 py-2">
                      <div className="text-xs text-gray-500">{label}</div>
                      <div className="font-medium">
                        {check?.preserved ?? 0}/{check?.total ?? 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings with per-item actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-900">Warnings</h3>
                {(selected.warnings || []).length === 0 && (
                  <p className="text-sm text-gray-500">No itemized warnings on this result.</p>
                )}
                <ul className="space-y-3">
                  {(selected.warnings || []).map((w) => (
                    <li
                      key={w.id}
                      className={`rounded border px-3 py-3 ${severityClass[w.severity] || severityClass.informational}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            {w.severity} · {w.category}
                          </span>
                          <p className="text-sm mt-1">{w.message}</p>
                        </div>
                        <div className="flex gap-1" role="group" aria-label={`Resolve warning ${w.id}`}>
                          {['accept', 'override', 'dismiss'].map((act) => (
                            <button
                              key={act}
                              type="button"
                              onClick={() => setWarningAction(w.id, act)}
                              className={`text-xs px-2 py-1 rounded border ${
                                resolutions[w.id] === act
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : 'bg-white/80 border-current/30 hover:bg-white'
                              }`}
                            >
                              {act}
                            </button>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Transformed content preview */}
              {version && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Transformed content preview</h3>
                  <pre className="text-sm whitespace-pre-wrap max-h-64 overflow-auto bg-gray-50 rounded p-3 border">
                    {(version.content || '').slice(0, 4000)}
                    {(version.content || '').length > 4000 ? '…' : ''}
                  </pre>
                  {version.what_changed && (
                    <p className="text-xs text-gray-500 mt-2">{version.what_changed}</p>
                  )}
                </div>
              )}

              {/* Decision form */}
              <form onSubmit={submitReview} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-gray-900">Record decision</h3>
                <div>
                  <label htmlFor="reviewer-name" className="block text-sm font-medium text-gray-700">
                    Reviewer name
                  </label>
                  <input
                    id="reviewer-name"
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="mt-1 w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <fieldset>
                  <legend className="text-sm font-medium text-gray-700 mb-2">Decision</legend>
                  <div className="space-y-2">
                    {DECISIONS.map((d) => (
                      <label
                        key={d.value}
                        className={`flex gap-3 items-start rounded border px-3 py-2 cursor-pointer ${
                          decision === d.value ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="decision"
                          value={d.value}
                          checked={decision === d.value}
                          onChange={() => setDecision(d.value)}
                          className="mt-1"
                        />
                        <span>
                          <span className="font-medium text-sm">{d.label}</span>
                          <span className="block text-xs text-gray-600">{d.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="reviewer-notes" className="block text-sm font-medium text-gray-700">
                    Notes (optional)
                  </label>
                  <textarea
                    id="reviewer-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Rationale for override or rejection…"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                  >
                    {submitting ? 'Saving…' : 'Submit decision'}
                  </button>
                  <Link
                    to={`/documents/${selected.document_id}/export`}
                    className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Export package
                  </Link>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
