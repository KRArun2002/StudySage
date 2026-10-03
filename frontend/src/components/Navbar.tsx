import { Link } from 'react-router-dom'
import './Navbar.css'

export function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        StudySage
      </Link>
    </header>
  )
}
