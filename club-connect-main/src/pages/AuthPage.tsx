import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/inicio");
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/inicio");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nombre } },
        });
        if (error) throw error;
        toast({ title: "Registro exitoso", description: "Revisá tu email para confirmar tu cuenta." });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Card */}
      <div
        className="w-full max-w-sm animate-fade-in-up"
        style={{
          background: "rgba(12,12,12,0.92)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderTop: "3px solid #CC1E1E",
          borderRadius: "3px",
          backdropFilter: "blur(20px)",
          padding: "2.5rem 2rem",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/escudo_de_sportivo.jpg"
            alt="Escudo"
            className="h-20 w-20 rounded-full object-cover mb-4"
            style={{
              border: "2px solid #CC1E1E",
              boxShadow: "0 0 24px rgba(204,30,30,0.3)"
            }}
          />
          <h1
            className="text-3xl text-white leading-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.1em" }}
          >
            Club Sportivo
          </h1>
          <span
            className="text-xs mt-0.5 uppercase tracking-widest"
            style={{ color: "#B8962E", fontFamily: "'Barlow', sans-serif" }}
          >
            Balnearia · Desde 1926
          </span>

          <div className="mt-4 h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #CC1E1E, transparent)" }} />
        </div>

        {/* Toggle */}
        <div
          className="flex mb-6 rounded-sm overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {[{ key: true, label: "Ingresar", Icon: LogIn }, { key: false, label: "Registrarse", Icon: UserPlus }].map(
            ({ key, label, Icon }) => (
              <button
                key={String(key)}
                onClick={() => setIsLogin(key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold uppercase tracking-widest transition-all"
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  background: isLogin === key ? "#CC1E1E" : "transparent",
                  color: isLogin === key ? "white" : "rgba(255,255,255,0.4)",
                }}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            )
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1.5"
                style={{ fontFamily: "'Oswald', sans-serif", color: "rgba(255,255,255,0.5)" }}>
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required={!isLogin}
                className="w-full px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "2px",
                  fontFamily: "'Barlow', sans-serif",
                }}
                onFocus={e => e.target.style.borderColor = "#CC1E1E"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-widest mb-1.5"
              style={{ fontFamily: "'Oswald', sans-serif", color: "rgba(255,255,255,0.5)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "2px",
                fontFamily: "'Barlow', sans-serif",
              }}
              onFocus={e => e.target.style.borderColor = "#CC1E1E"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-1.5"
              style={{ fontFamily: "'Oswald', sans-serif", color: "rgba(255,255,255,0.5)" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "2px",
                fontFamily: "'Barlow', sans-serif",
              }}
              onFocus={e => e.target.style.borderColor = "#CC1E1E"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 mt-2 text-sm font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
            style={{
              fontFamily: "'Oswald', sans-serif",
              background: submitting ? "rgba(204,30,30,0.5)" : "#CC1E1E",
              borderRadius: "2px",
              letterSpacing: "0.15em",
            }}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLogin ? "Ingresar al club" : "Crear cuenta"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-white/20 uppercase tracking-widest" style={{ fontFamily: "'Barlow', sans-serif" }}>
        Club Sportivo Balnearia © 1926–2026
      </p>
    </div>
  );
}
