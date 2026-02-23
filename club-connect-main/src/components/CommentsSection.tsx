import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageCircle, Send } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface Comment {
  id: string;
  contenido: string;
  created_at: string;
  user_id: string;
  autor_nombre?: string;
}

export function CommentsSection({ publicacionId }: { publicacionId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");

  const { data: comments = [] } = useQuery({
    queryKey: ["comentarios", publicacionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comentarios")
        .select("*")
        .eq("publicacion_id", publicacionId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nombre")
        .in("id", userIds);

      const nameMap = new Map(profiles?.map((p) => [p.id, p.nombre]) ?? []);
      return data.map((c) => ({
        ...c,
        autor_nombre: nameMap.get(c.user_id) ?? "Usuario",
      })) as Comment[];
    },
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    const channel = supabase
      .channel(`comentarios-${publicacionId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "comentarios",
        filter: `publicacion_id=eq.${publicacionId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["comentarios", publicacionId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [open, publicacionId, queryClient]);

  const mutation = useMutation({
    mutationFn: async (contenido: string) => {
      const { error } = await supabase.from("comentarios").insert({
        publicacion_id: publicacionId,
        user_id: user!.id,
        contenido,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTexto("");
      queryClient.invalidateQueries({ queryKey: ["comentarios", publicacionId] });
    },
    onError: () => toast.error("Error al enviar el comentario"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    mutation.mutate(texto.trim());
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-4 py-3 text-xs uppercase tracking-widest transition-colors w-full"
          style={{
            fontFamily: "'Oswald', sans-serif",
            color: open ? "#CC1E1E" : "rgba(255,255,255,0.3)",
            letterSpacing: "0.1em",
          }}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Comentarios
          {comments.length > 0 && (
            <span
              className="ml-auto text-xs px-1.5 py-0.5 rounded-sm"
              style={{ background: "#CC1E1E", color: "white", fontFamily: "'Oswald', sans-serif" }}
            >
              {comments.length}
            </span>
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {comments.length > 0 && (
            <div className="space-y-2.5 max-h-48 overflow-y-auto pt-3">
              {comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white/80 text-xs uppercase tracking-wide"
                      style={{ fontFamily: "'Oswald', sans-serif" }}>
                      {c.autor_nombre}
                    </span>
                    <span className="text-white/25 text-xs">
                      {format(new Date(c.created_at), "d MMM, HH:mm", { locale: es })}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm mt-0.5 leading-snug">{c.contenido}</p>
                </div>
              ))}
            </div>
          )}

          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribí un comentario..."
                className="flex-1 px-3 py-2 text-xs text-white placeholder-white/25 outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "2px",
                  fontFamily: "'Barlow', sans-serif",
                }}
                onFocus={e => e.target.style.borderColor = "#CC1E1E"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              <button
                type="submit"
                disabled={mutation.isPending || !texto.trim()}
                className="flex items-center justify-center h-8 w-8 shrink-0 transition-all"
                style={{
                  background: "#CC1E1E",
                  borderRadius: "2px",
                  opacity: mutation.isPending || !texto.trim() ? 0.4 : 1,
                }}
              >
                <Send className="h-3.5 w-3.5 text-white" />
              </button>
            </form>
          ) : (
            <p className="text-xs italic pt-2" style={{ color: "rgba(255,255,255,0.25)" }}>
              Iniciá sesión para comentar.
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
