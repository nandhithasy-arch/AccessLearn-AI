import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Educational content, made accessible — and verified.
      </h1>
      <p className="text-gray-600 mb-8">
        AccessLearn AI analyzes the full structure of a lesson, generates
        personalized accessible versions, and checks every transformation
        against the original meaning — so simplification never becomes
        silent deletion.
      </p>
      <Link
        to="/upload"
        className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-3 rounded-lg"
      >
        Upload a lesson
      </Link>
    </div>
  )
}
