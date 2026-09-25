const PROFILES = [
  { value: 'visual_accessibility', label: 'Visual accessibility', desc: 'Alt text, diagram descriptions, screen-reader HTML' },
  { value: 'reading_complexity', label: 'Reading complexity', desc: 'Simplified language, glossary, preserved terminology' },
  { value: 'hearing_accessibility', label: 'Hearing accessibility', desc: 'Captions, transcripts, non-speech audio cues' },
  { value: 'language_accessibility', label: 'Language accessibility', desc: 'Translation with bilingual glossary' },
  { value: 'cognitive_accessibility', label: 'Cognitive accessibility', desc: 'Overview, objectives, flashcards, knowledge checks' },
  { value: 'dyslexia_friendly', label: 'Dyslexia-friendly', desc: 'Shorter paragraphs, spacing, highlighted keywords' },
]

/** value: selected profile string | null. onChange(profileValue) */
export default function ProfileSelector({ value, onChange }) {
  return (
    <fieldset>
      <legend className="font-semibold text-gray-900 mb-3">Learner accessibility profile</legend>
      <div className="grid sm:grid-cols-2 gap-3">
        {PROFILES.map((profile) => (
          <label
            key={profile.value}
            className={`border rounded-lg p-4 cursor-pointer block ${
              value === profile.value ? 'border-brand-500 ring-1 ring-brand-500 bg-brand-50' : 'border-gray-200 bg-white'
            }`}
          >
            <input
              type="radio"
              name="learner-profile"
              value={profile.value}
              checked={value === profile.value}
              onChange={() => onChange(profile.value)}
              className="sr-only"
            />
            <span className="block font-medium text-gray-900 text-sm">{profile.label}</span>
            <span className="block text-xs text-gray-500 mt-1">{profile.desc}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
