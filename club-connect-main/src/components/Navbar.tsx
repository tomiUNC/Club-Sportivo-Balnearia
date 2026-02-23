import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Shield, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/AuthModal";

const menuItems = [
  { label: "Inicio", to: "/inicio" },
  { label: "Vóley", to: "/voley" },
  { label: "Patín", to: "/patin" },
  { label: "Básquet", to: "/basquet" },
  { label: "Pádel", to: "/padel" },
];

const futbolSubItems = [
  { label: "Primera y reserva", to: "/futbol/primera-reserva" },
  { label: "Femenino", to: "/futbol/femenino" },
  { label: "Inferiores", to: "/futbol/inferiores" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [futbolOpen, setFutbolOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <nav className="navbar-club sticky top-0 z-50 w-full">
        {/* Stripe top */}
        <div className="h-[2px] w-full" style={{
          background: "linear-gradient(90deg, #CC1E1E 0%, #B8962E 50%, #CC1E1E 100%)"
        }} />

        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/escudo_de_sportivo.jpg"
              alt="Escudo Club Sportivo Balnearia"
              className="h-9 w-9 rounded-full object-cover border border-[#CC1E1E]/50 group-hover:border-[#CC1E1E] transition-all"
            />
            <div className="hidden sm:block">
              <span className="navbar-brand block leading-none">Club Sportivo</span>
              <span style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: "#B8962E",
                textTransform: "uppercase"
              }}>Balnearia · 1926</span>
            </div>
          </Link>

          {/* Desktop menu */}
          <div className="hidden items-center gap-0.5 md:flex">
            {menuItems.slice(0, 1).map((item) => (
              <Link key={item.to} to={item.to} className="nav-link-club">
                {item.label}
              </Link>
            ))}

            {/* Fútbol dropdown */}
            <div className="relative group">
              <button className="nav-link-club inline-flex items-center gap-1">
                Fútbol <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              <div className="absolute top-full left-0 mt-1 hidden group-hover:block z-50 min-w-[180px]"
                style={{
                  background: "rgba(12,12,12,0.98)",
                  border: "1px solid rgba(204,30,30,0.3)",
                  borderTop: "2px solid #CC1E1E",
                  borderRadius: "2px",
                }}>
                {futbolSubItems.map((sub) => (
                  <Link
                    key={sub.to}
                    to={sub.to}
                    className="block px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-white/70 hover:text-white hover:bg-[#CC1E1E]/10 transition-colors"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>

            {menuItems.slice(1).map((item) => (
              <Link key={item.to} to={item.to} className="nav-link-club">
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                className="ml-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-all"
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  background: "rgba(204,30,30,0.15)",
                  border: "1px solid rgba(204,30,30,0.5)",
                  borderRadius: "2px",
                  color: "#CC1E1E",
                  letterSpacing: "0.12em"
                }}
              >
                <Shield className="h-3 w-3" />
                Admin
              </Link>
            )}

            {user ? (
              <button
                onClick={handleSignOut}
                className="nav-link-club ml-2 inline-flex items-center gap-1 opacity-60 hover:opacity-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                Salir
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="ml-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-all"
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  background: "#CC1E1E",
                  borderRadius: "2px",
                  color: "white",
                  letterSpacing: "0.1em"
                }}
              >
                <LogIn className="h-3.5 w-3.5" />
                Ingresar
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            background: "rgba(10,10,10,0.98)",
            borderTop: "1px solid rgba(204,30,30,0.2)"
          }}>
            <div className="space-y-0.5 px-4 pb-4 pt-2">
              {menuItems.slice(0, 1).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block py-2.5 text-sm font-medium uppercase tracking-widest text-white/70 hover:text-white border-b border-white/5"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <button
                className="flex w-full items-center justify-between py-2.5 text-sm font-medium uppercase tracking-widest text-white/70 hover:text-white border-b border-white/5"
                style={{ fontFamily: "'Oswald', sans-serif" }}
                onClick={() => setFutbolOpen(!futbolOpen)}
              >
                Fútbol
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", futbolOpen && "rotate-180")} />
              </button>
              {futbolOpen && (
                <div className="pl-3 border-l-2 border-[#CC1E1E]/40 ml-2">
                  {futbolSubItems.map((sub) => (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      className="block py-2 text-xs uppercase tracking-widest text-white/50 hover:text-white/80"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                      onClick={() => setMobileOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}

              {menuItems.slice(1).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block py-2.5 text-sm font-medium uppercase tracking-widest text-white/70 hover:text-white border-b border-white/5"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 py-2.5 text-sm font-medium uppercase tracking-widest"
                  style={{ fontFamily: "'Oswald', sans-serif", color: "#CC1E1E" }}
                  onClick={() => setMobileOpen(false)}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Panel Admin
                </Link>
              )}

              {user ? (
                <button
                  className="flex w-full items-center gap-2 py-2.5 text-sm uppercase tracking-widest text-white/40 hover:text-white/70"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cerrar sesión
                </button>
              ) : (
                <button
                  className="flex w-full items-center gap-2 py-2.5 text-sm font-semibold uppercase tracking-widest"
                  style={{ fontFamily: "'Oswald', sans-serif", color: "#CC1E1E" }}
                  onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
