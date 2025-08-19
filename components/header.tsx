import Link from 'next/link'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-gray-200/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <svg 
            viewBox="0 0 24 24" 
            className="w-8 h-8 text-green-500"
            fill="currentColor"
          >
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 9.2c-2.5 0-4.71-1.28-6-3.2.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1c-1.29 1.92-3.5 3.2-6 3.2z"/>
          </svg>
          <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-teal-400 text-transparent bg-clip-text">
            CarePulse
          </span>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link href="/appointments" className="text-sm font-medium text-gray-200 hover:text-green-400 transition-colors">
            Appointments
          </Link>
          <Link href="#" className="text-sm font-medium text-gray-200 hover:text-green-400 transition-colors">
            Dashboard
          </Link>
          <Link href="#" className="text-sm font-medium text-gray-200 hover:text-green-400 transition-colors">
            Profile
          </Link>
        </nav>
      </div>
    </header>
  )
}
