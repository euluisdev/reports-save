import "./globals.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <div className="layout">
        <Navbar />
        <main className="content">{children}</main>
        <Footer />
        </div>
      </body>
    </html>
  );
}
