import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Upload from './pages/Upload.jsx'
import Processing from './pages/Processing.jsx'
import Analysis from './pages/Analysis.jsx'
import Transform from './pages/Transform.jsx'
import Comparison from './pages/Comparison.jsx'
import Reader from './pages/Reader.jsx'
import Export from './pages/Export.jsx'
import Review from './pages/Review.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip link: first focusable element, required for keyboard users
          on every page -- see spec section 11 (accessible reader) and the
          general "the interface itself must be accessible" rule. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-brand-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/documents/:documentId/processing" element={<Processing />} />
          <Route path="/documents/:documentId/analysis" element={<Analysis />} />
          <Route path="/documents/:documentId/transform" element={<Transform />} />
          <Route path="/documents/:documentId/comparison" element={<Comparison />} />
          <Route path="/documents/:documentId/reader" element={<Reader />} />
          <Route path="/documents/:documentId/export" element={<Export />} />
          <Route path="/review" element={<Review />} />
        </Routes>
      </main>
    </div>
  )
}
