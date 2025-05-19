import './NavBar.css';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <img src="/logo-ieb.png" alt="Logo" className="logo-icon" />
          <span>METROLOGIA IEB-PE</span>
        </div>
        <nav className="nav-links">
          <a href="/">Register</a>
          <a href="/reports">Reports</a>
          <a href="/graphics">graphics</a>
        </nav>
      </div>
    </header>
  );
}
