import { useParams } from 'react-router-dom'
import { api } from '../api/client.js'

export default function Export() {
  const { documentId } = useParams()

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">Export</h1>
      <p className="text-gray-600 mb-6 text-sm">
        Download the original content, every generated accessible version,
        and the semantic validation report as a single bundle.
      </p>
      <a
        href={api.exportUrl(documentId)}
        className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-3 rounded-lg"
      >
        Download bundle (.zip)
      </a>
    </div>
  )
}
