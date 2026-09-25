import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/upload', label: 'Upload' },
  { to: '/review', label: 'Review' },
]

export default function Navbar() {
  const location = useLocation()
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav
        aria-label="Main navigation"
        className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between"
      >
        <Link to="/" className="font-semibold text-lg text-brand-700">
          AccessLearn <span className="text-brand-500">AI</span>
        </Link>
        <ul className="flex gap-6">
          {LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                aria-current={location.pathname === link.to ? 'page' : undefined}
                className={`text-sm font-medium hover:text-brand-600 ${
                  location.pathname === link.to ? 'text-brand-600' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
