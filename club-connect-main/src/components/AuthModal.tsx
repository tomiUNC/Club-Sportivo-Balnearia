import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "¡Bienvenido!" });
        onOpenChange(false);
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { nombre } } });
        if (error) throw error;
        toast({ title: "Registro exitoso", description: "Revisá tu email para confirmar." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => { setEmail(""); setPassword(""); setNombre(""); setIsLogin(true); };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "2px",
    fontFamily: "'Barlow', sans-serif",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent
        className="p-0 border-0 max-w-sm"
        style={{
          background: "rgba(12,12,12,0.97)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderTop: "3px solid #CC1E1E",
          borderRadius: "3px",
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.08em" }}>
              {isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </h2>
            <button onClick={() => onOpenChange(false)} className="text-white/30 hover:text-white/70 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required={!isLogin}
                className="w-full px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#CC1E1E"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            )}
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#CC1E1E"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#CC1E1E"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 text-sm font-bold uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all"
              style={{
                fontFamily: "'Oswald', sans-serif",
                background: "#CC1E1E",
                borderRadius: "2px",
                letterSpacing: "0.12em",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLogin ? "Ingresar" : "Registrarse"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-white/30">
            {isLogin ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold underline"
              style={{ color: "#CC1E1E" }}
            >
              {isLogin ? "Registrate" : "Iniciá sesión"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
