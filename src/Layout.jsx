import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Menu, X, Trophy, Gift, Crown, Mic, Gamepad2, CreditCard, Shield } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Inicio", path: "Home", icon: Trophy },
    { name: "Premios", path: "Premios", icon: Gift },
    { name: "Ganadores", path: "Ganadores", icon: Crown },
    { name: "Podcast", path: "Podcast", icon: Mic },
    { name: "Gaming", path: "Gaming", icon: Gamepad2 },
    { name: "Participar", path: "Participar", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#0F0F1E] to-[#0A0A0F]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        :root {
          --primary: #8B5CF6;
          --primary-dark: #7C3AED;
          --secondary: #A855F7;
          --accent-cyan: #06B6D4;
          --accent-pink: #EC4899;
          --bg-dark: #0A0A0F;
          --bg-darker: #050508;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .glow-purple {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2);
        }
        
        .glow-cyan {
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2);
        }
        
        .text-glow {
          text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
        }
      `}</style>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-lg border-b border-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center glow-purple">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">ICC <span className="text-purple-500">WINS</span></h1>
                <p className="text-xs text-purple-400 font-semibold">LATAM COMMUNITY</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={createPageUrl(link.path)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                    currentPageName === link.path
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))}
              
              <Link
                to={createPageUrl("Admin")}
                className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0F0F1E] border-t border-purple-900/20">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={createPageUrl(link.path)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                    currentPageName === link.path
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              ))}
              <Link
                to={createPageUrl("Admin")}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg"
              >
                <Shield className="w-5 h-5" />
                Admin
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#050508] border-t border-purple-900/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">ICC <span className="text-purple-500">WINS</span></h2>
                  <p className="text-xs text-purple-400 font-semibold">LATAM COMMUNITY</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                La plataforma #1 de sorteos y comunidad gaming en Latinoamérica con ICC Agency. 
                Únete, participa y gana premios increíbles.
              </p>
              <div className="flex gap-3">
                <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" 
                   className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center transition-all">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center transition-all">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="https://www.twitch.tv" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-purple-700 hover:bg-purple-800 rounded-lg flex items-center justify-center transition-all">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-white font-bold mb-4">Navegación</h3>
              <ul className="space-y-2">
                <li><Link to={createPageUrl("Premios")} className="text-gray-400 hover:text-purple-400 text-sm transition-colors">Premios</Link></li>
                <li><Link to={createPageUrl("Ganadores")} className="text-gray-400 hover:text-purple-400 text-sm transition-colors">Ganadores</Link></li>
                <li><Link to={createPageUrl("Podcast")} className="text-gray-400 hover:text-purple-400 text-sm transition-colors">Podcast</Link></li>
                <li><Link to={createPageUrl("Gaming")} className="text-gray-400 hover:text-purple-400 text-sm transition-colors">Gaming</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-400">📧 info@gamerwins.com</li>
                <li className="text-gray-400">📱 +51 999 999 999</li>
                <li className="text-gray-400">🌎 Lima, Perú</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-900/20 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 ICC WINS LATAM. Todos los derechos reservados. | Sorteos transparentes y legales
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}