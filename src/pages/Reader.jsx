import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client.js'

const FONT_SIZES = { small: '1rem', medium: '1.25rem', large: '1.5rem' }
const LINE_SPACINGS = { normal: '1.6', relaxed: '2', loose: '2.4' }

export default function Reader() {
  const { documentId } = useParams()
  const [versions, setVersions] = useState([])
  const [activeVersionId, setActiveVersionId] = useState(null)
  const [fontSize, setFontSize] = useState('medium')
  const [lineSpacing, setLineSpacing] = useState('normal')
  const [highContrast, setHighContrast] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [document, setDocument] = useState(null)
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef(null)

  useEffect(() => {
    Promise.all([api.listVersions(documentId), api.getDocument(documentId)])
      .then(([versionList, doc]) => {
        setVersions(versionList)
        setDocument(doc)
        if (versionList.length) setActiveVersionId(versionList[0].id)
      })
      .catch(() => {})
  }, [documentId])

  const activeVersion = versions.find((v) => v.id === activeVersionId)
  const displayText = showOriginal
    ? document?.sections?.map((s) => s.text).join('\n\n')
    : activeVersion?.content

  const toggleSpeech = () => {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    if (!displayText) return
    const utterance = new SpeechSynthesisUtterance(displayText)
    utterance.onend = () => setSpeaking(false)
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <div className={highContrast ? 'bg-black text-yellow-300 -mx-4 px-4 py-6 rounded-lg' : ''}>
      <h1 className="text-2xl font-bold mb-6">Accessible reader</h1>

      <div className="flex flex-wrap gap-4 items-end mb-6 bg-white border rounded-lg p-4" style={highContrast ? { background: '#111' } : {}}>
        {versions.length > 1 && (
          <div>
            <label htmlFor="version-select" className="block text-xs font-medium mb-1">
              Version
            </label>
            <select
              id="version-select"
              value={activeVersionId ?? ''}
              onChange={(e) => setActiveVersionId(e.target.value)}
              className="border rounded px-2 py-1 text-sm text-gray-900"
            >
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.format}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="font-size" className="block text-xs font-medium mb-1">
            Font size
          </label>
          <select
            id="font-size"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="border rounded px-2 py-1 text-sm text-gray-900"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <label htmlFor="line-spacing" className="block text-xs font-medium mb-1">
            Line spacing
          </label>
          <select
            id="line-spacing"
            value={lineSpacing}
            onChange={(e) => setLineSpacing(e.target.value)}
            className="border rounded px-2 py-1 text-sm text-gray-900"
          >
            <option value="normal">Normal</option>
            <option value="relaxed">Relaxed</option>
            <option value="loose">Loose</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
          High contrast
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showOriginal} onChange={(e) => setShowOriginal(e.target.checked)} />
          Show original instead
        </label>

        <button
          onClick={toggleSpeech}
          aria-pressed={speaking}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          {speaking ? 'Stop reading aloud' : 'Read aloud'}
        </button>
      </div>

      <div
        style={{
          fontSize: FONT_SIZES[fontSize],
          lineHeight: LINE_SPACINGS[lineSpacing],
          textAlign: 'left', // never justified -- spec: avoid justified text
        }}
        className="whitespace-pre-wrap max-w-prose"
      >
        {displayText || 'No content generated yet.'}
      </div>
    </div>
  )
}
