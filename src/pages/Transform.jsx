import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import ProfileSelector from '../components/ProfileSelector.jsx'

const FORMAT_CARDS = [
  { value: 'simplified_text', label: 'Simplify language' },
  { value: 'alt_text', label: 'Generate alt text' },
  { value: 'screen_reader_html', label: 'Screen-reader HTML' },
  { value: 'audio_script', label: 'Generate audio script' },
  { value: 'captions', label: 'Add captions' },
  { value: 'translation', label: 'Translate' },
  { value: 'math_spoken', label: 'Convert equations' },
  { value: 'glossary', label: 'Create glossary' },
  { value: 'summary', label: 'Generate summary' },
  { value: 'dyslexia_friendly', label: 'Dyslexia-friendly text' },
]

// Mirrors backend _PROFILE_DEFAULTS so the UI pre-selects the right formats.
const PROFILE_DEFAULTS = {
  visual_accessibility: {
    formats: ['alt_text', 'screen_reader_html', 'math_spoken', 'audio_script'],
    readingLevel: 'unchanged',
  },
  reading_complexity: {
    formats: ['simplified_text', 'glossary', 'summary'],
    readingLevel: 'middle_school',
  },
  hearing_accessibility: {
    formats: ['captions', 'audio_script', 'screen_reader_html'],
    readingLevel: 'unchanged',
  },
  language_accessibility: {
    formats: ['translation', 'glossary', 'simplified_text'],
    readingLevel: 'middle_school',
  },
  cognitive_accessibility: {
    formats: ['simplified_text', 'summary', 'glossary', 'dyslexia_friendly'],
    readingLevel: 'elementary',
  },
  dyslexia_friendly: {
    formats: ['dyslexia_friendly', 'audio_script', 'glossary'],
    readingLevel: 'elementary',
  },
}

export default function Transform() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [formats, setFormats] = useState([])
  const [readingLevel, setReadingLevel] = useState('middle_school')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const toggleFormat = (value) => {
    setFormats((prev) => (prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]))
  }

  const handleProfileChange = (value) => {
    setProfile(value)
    const defaults = PROFILE_DEFAULTS[value]
    if (defaults) {
      setFormats(defaults.formats)
      setReadingLevel(defaults.readingLevel)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await api.transformDocument(documentId, {
        document_id: documentId,
        target_formats: formats,
        reading_level: readingLevel,
        learner_profile: profile,
        language: profile === 'language_accessibility' ? 'es' : 'en',
      })
      navigate(`/documents/${documentId}/comparison`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Choose accessible outputs</h1>

      <ProfileSelector value={profile} onChange={handleProfileChange} />

      <fieldset>
        <legend className="font-semibold text-gray-900 mb-3">Output formats</legend>
        <div className="grid sm:grid-cols-3 gap-3">
          {FORMAT_CARDS.map((f) => (
            <label
              key={f.value}
              className={`border rounded-lg p-3 text-sm font-medium cursor-pointer text-center ${
                formats.includes(f.value) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={formats.includes(f.value)}
                onChange={() => toggleFormat(f.value)}
              />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="reading-level" className="block font-semibold text-gray-900 mb-2">
          Target reading level
        </label>
        <select
          id="reading-level"
          value={readingLevel}
          onChange={(e) => setReadingLevel(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="elementary">Elementary</option>
          <option value="middle_school">Middle school</option>
          <option value="high_school">High school</option>
          <option value="unchanged">Unchanged</option>
        </select>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={formats.length === 0 || submitting}
        className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-medium px-6 py-3 rounded-lg"
      >
        {submitting ? 'Generating…' : 'Generate accessible versions'}
      </button>
    </div>
  )
}
