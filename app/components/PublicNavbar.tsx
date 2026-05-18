"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/app/components/Logo";

const NAV_LINKS = [
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/faq", label: "F.A.Q." },
  { href: "/a-propos", label: "À propos" },
];

export default function PublicNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setMenuOpen(false);
  }

  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 flex items-center justify-between h-16 gap-8">

        {/* Logo */}
        <Link href="/" className="logo-link shrink-0">
          <Logo size={28} />
          <span>Claim<span style={{ opacity: 0.5 }}>.</span>e</span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-links hidden md:flex flex-1 justify-center">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </div>

        {/* Right side — auth buttons always visible + hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="btn btn-primary text-xs sm:text-sm">
                📦 <span className="hidden sm:inline">Mon </span>Dashboard
              </Link>
              <button onClick={logout} className="hidden md:flex btn btn-ghost text-sm">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost text-xs sm:text-sm">Se connecter</Link>
              <Link href="/signup" className="btn btn-primary text-xs sm:text-sm">Essayer</Link>
            </>
          )}

          {/* Hamburger — mobile uniquement */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl hover:bg-white/5 transition-colors ml-1 gap-1.5"
            aria-label="Ouvrir le menu"
          >
            <span className={`block w-5 h-0.5 bg-slate-300 rounded-full transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-300 rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-slate-300 rounded-full transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="border-t border-border/50 bg-surface/95 backdrop-blur-xl px-4 py-2 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 font-medium text-sm transition-all"
            >
              {label}
            </Link>
          ))}
          {isLoggedIn && (
            <button
              onClick={logout}
              className="flex items-center px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all text-left"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
