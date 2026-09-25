import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'

const STATUS_STYLES = {
  uploaded: 'bg-gray-100 text-gray-700',
  extracting: 'bg-blue-100 text-blue-800',
  analyzing: 'bg-blue-100 text-blue-800',
  analyzed: 'bg-emerald-100 text-emerald-800',
  transforming: 'bg-blue-100 text-blue-800',
  ready: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
}

// Where "continue" should take you, based on how far a document has gotten.
function continueHref(doc) {
  if (doc.status === 'uploaded' || doc.status === 'failed') {
    return `/documents/${doc.document_id}/processing`
  }
  if (doc.status === 'ready') {
    return `/documents/${doc.document_id}/comparison`
  }
  return `/documents/${doc.document_id}/analysis`
}

export default function Dashboard() {
  const [documents, setDocuments] = useState(null)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    load()
  }, [])

  function load() {
    api
      .listDocuments()
      .then(setDocuments)
      .catch((err) => setError(err.message))
  }

  async function handleDelete(id) {
    setDeletingId(id)
    try {
      await api.deleteDocument(id)
      setDocuments((prev) => prev.filter((d) => d.document_id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your documents</h1>
        <Link
          to="/upload"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          Upload new
        </Link>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 mb-4">
          {error}
        </p>
      )}

      {documents === null && !error && (
        <p className="text-sm text-gray-500">Loading your documents…</p>
      )}

      {documents?.length === 0 && (
        <div className="bg-white border rounded-lg p-10 text-center text-gray-500 text-sm">
          No documents yet. Upload one to see its accessibility score and
          processing status here.
        </div>
      )}

      {documents?.length > 0 && (
        <table className="w-full text-sm border-collapse bg-white border rounded-lg overflow-hidden">
          <caption className="sr-only">Your uploaded documents</caption>
          <thead>
            <tr className="text-left border-b border-gray-200 bg-gray-50">
              <th scope="col" className="py-3 px-4 font-medium text-gray-600">
                File
              </th>
              <th scope="col" className="py-3 px-4 font-medium text-gray-600">
                Status
              </th>
              <th scope="col" className="py-3 px-4 font-medium text-gray-600">
                Accessibility score
              </th>
              <th scope="col" className="py-3 px-4 font-medium text-gray-600">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.document_id} className="border-b border-gray-100 last:border-0">
                <td className="py-3 px-4 text-gray-800">
                  {doc.document_title || doc.source_filename}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      STATUS_STYLES[doc.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {doc.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {doc.accessibility_score ? `${doc.accessibility_score.overall}/100` : '—'}
                </td>
                <td className="py-3 px-4 text-right space-x-4">
                  <Link to={continueHref(doc)} className="text-brand-600 hover:text-brand-700 font-medium">
                    Continue →
                  </Link>
                  <button
                    onClick={() => handleDelete(doc.document_id)}
                    disabled={deletingId === doc.document_id}
                    className="text-gray-400 hover:text-red-600"
                  >
                    {deletingId === doc.document_id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
