const CATEGORIES = [
  { key: 'text', label: 'Text' },
  { key: 'visual', label: 'Visual' },
  { key: 'audio', label: 'Audio' },
  { key: 'structural', label: 'Structural' },
]

function barColor(score) {
  if (score >= 70) return 'bg-emerald-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

/** score: AccessibilityScore shape from the backend, or null while loading. */
export default function AccessibilityScoreCard({ score }) {
  if (!score) {
    return <div className="bg-white border rounded-lg p-6 text-gray-400 text-sm">No score yet</div>
  }
  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Accessibility score</h2>
        <span className="text-2xl font-bold text-gray-900">{score.overall}/100</span>
      </div>
      <div className="space-y-3">
        {CATEGORIES.map(({ key, label }) => (
          <div key={key}>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{label}</span>
              <span>{score[key]}/100</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={score[key]}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${label} accessibility score`}
              className="h-2 bg-gray-100 rounded-full overflow-hidden"
            >
              <div className={`h-full ${barColor(score[key])}`} style={{ width: `${score[key]}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4">{score.note}</p>
    </div>
  )
}
