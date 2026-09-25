import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client.js'
import IssueTable from '../components/IssueTable.jsx'
import AccessibilityScoreCard from '../components/AccessibilityScoreCard.jsx'

export default function Analysis() {
  const { documentId } = useParams()
  const [document, setDocument] = useState(null)
  const [issues, setIssues] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api.getDocument(documentId), api.getIssues(documentId)])
      .then(([doc, issueList]) => {
        setDocument(doc)
        setIssues(issueList)
      })
      .catch((err) => setError(err.message))
  }, [documentId])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{document?.document_title || 'Document analysis'}</h1>
        <Link
          to={`/documents/${documentId}/transform`}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          Choose accessible outputs →
        </Link>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 mb-4">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Detected issues</h2>
          <IssueTable issues={issues} />
        </div>
        <AccessibilityScoreCard score={document?.accessibility_score} />
      </div>
    </div>
  )
}
