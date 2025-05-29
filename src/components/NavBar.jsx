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
          <a href="/">REGISTER</a>
          <a href="/reports">REPORTS</a>
          <a href="/graphics">GRAPHICS</a>
        </nav>
      </div>
    </header>
  );
}
