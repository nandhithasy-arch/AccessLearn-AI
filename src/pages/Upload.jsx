import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

const SUPPORTED_FORMATS = ['PDF', 'Image (PNG/JPG)', 'TXT', 'DOCX']

export default function Upload() {
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) setFile(dropped)
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const doc = await api.uploadDocument(file)
      navigate(`/documents/${doc.document_id}/processing`)
    } catch (err) {
      // POST /documents/upload is fully implemented (validation + storage +
      // a real DB row) -- an error here is a genuine problem: unsupported
      // file type (415), empty file (400), oversize (413), or the backend
      // being unreachable, not an expected stub response.
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Upload educational content</h1>
      <p className="text-gray-600 mb-6">Supported formats: {SUPPORTED_FORMATS.join(', ')}</p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-white"
      >
        <label htmlFor="file-input" className="block cursor-pointer">
          <span className="text-brand-600 font-medium">Choose a file</span>{' '}
          <span className="text-gray-500">or drag it here</span>
        </label>
        <input
          id="file-input"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file && (
          <p className="mt-4 text-sm text-gray-700" role="status">
            Selected: {file.name} ({Math.round(file.size / 1024)} KB)
          </p>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Files are processed to generate accessible versions and are not
        retained longer than necessary. See our privacy notice for details.
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-6 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-medium px-6 py-3 rounded-lg"
      >
        {uploading ? 'Uploading…' : 'Upload and analyze'}
      </button>
    </div>
  )
}
