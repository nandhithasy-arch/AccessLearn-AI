import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client.js'

const SEVERITY_STYLES = {
  critical: 'bg-red-50 border-red-300 text-red-800',
  high: 'bg-orange-50 border-orange-300 text-orange-800',
  medium: 'bg-amber-50 border-amber-300 text-amber-800',
  low: 'bg-gray-50 border-gray-300 text-gray-700',
  informational: 'bg-blue-50 border-blue-300 text-blue-800',
}

export default function Comparison() {
  const { documentId } = useParams()
  const [document, setDocument] = useState(null)
  const [versions, setVersions] = useState([])
  const [validations, setValidations] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [doc, versionList] = await Promise.all([api.getDocument(documentId), api.listVersions(documentId)])
        setDocument(doc)
        setVersions(versionList)
        const validationResults = await api.validateDocument(documentId)
        setValidations(validationResults)
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [documentId])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Original vs. accessible version</h1>
        <Link
          to={`/documents/${documentId}/reader`}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          Open accessible reader →
        </Link>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 mb-4">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-3">Original</h2>
          <div className="text-sm text-gray-700 space-y-2">
            {document?.sections?.map((s) => (
              <p key={s.id}>{s.text}</p>
            ))}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-3">Accessible version</h2>
          <div className="text-sm text-gray-700 space-y-2">
            {versions.map((v) => (
              <div key={v.id}>
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{v.format}</p>
                <p>{v.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {validations.map((result) => (
        <div key={result.id} className="bg-white border rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Semantic consistency</h2>
            <span className="text-xl font-bold">{result.overall_consistency_score}%</span>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <dt className="text-gray-500">Concepts</dt>
              <dd className="font-medium">
                {result.concepts.preserved}/{result.concepts.total}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Relationships</dt>
              <dd className="font-medium">
                {result.relationships.preserved}/{result.relationships.total}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Numbers</dt>
              <dd className="font-medium">
                {result.numerical.preserved}/{result.numerical.total}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Negation</dt>
              <dd className="font-medium">
                {result.negation.preserved}/{result.negation.total}
              </dd>
            </div>
          </dl>
          {result.warnings.length > 0 && (
            <ul className="space-y-2">
              {result.warnings.map((w) => (
                <li key={w.id} className={`border rounded-md px-3 py-2 text-sm ${SEVERITY_STYLES[w.severity]}`}>
                  <span className="font-medium capitalize">{w.severity}:</span> {w.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
