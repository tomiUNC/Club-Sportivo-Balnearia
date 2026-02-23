import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsFeedProps {
  categoria?: string;
  title: string;
  subtitle?: string;
  logoSrc?: string;
}

export function NewsFeed({ categoria, title, subtitle, logoSrc }: NewsFeedProps) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["publicaciones", categoria],
    queryFn: async () => {
      let query = supabase
        .from("publicaciones")
        .select("*")
        .order("fecha", { ascending: false });

      if (categoria) {
        query = query.eq("categoria", categoria);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-2">
          {logoSrc && (
            <div className="relative">
              <img
                src={logoSrc}
                alt={title}
                className="h-14 w-14 object-contain rounded-full border-2"
                style={{ borderColor: "#CC1E1E", background: "rgba(0,0,0,0.5)" }}
              />
              <div className="absolute inset-0 rounded-full"
                style={{ boxShadow: "0 0 16px rgba(204,30,30,0.4)" }} />
            </div>
          )}
          <div>
            <h1
              className="text-4xl font-black leading-none text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.06em" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm mt-1" style={{ color: "#B8962E", fontFamily: "'Barlow', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {/* Decorative line */}
        <div className="mt-3 h-px w-full" style={{
          background: "linear-gradient(90deg, #CC1E1E, rgba(184,150,46,0.5), transparent)"
        }} />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="post-card-club">
              <Skeleton className="aspect-video w-full" style={{ background: "rgba(255,255,255,0.05)" }} />
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <Skeleton className="h-3 w-20" style={{ background: "rgba(255,255,255,0.05)" }} />
                </div>
                <Skeleton className="h-5 w-3/4" style={{ background: "rgba(255,255,255,0.05)" }} />
                <Skeleton className="h-3 w-full" style={{ background: "rgba(255,255,255,0.05)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : !posts?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-7xl font-black opacity-5 mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#CC1E1E" }}>
            SB
          </div>
          <p className="text-base text-white/30 uppercase tracking-widest"
            style={{ fontFamily: "'Oswald', sans-serif" }}>
            Aún no hay noticias{categoria ? ` en ${categoria}` : ""}.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <div
              key={post.id}
              className={`stagger-${Math.min(i + 1, 6)}`}
              style={{ animation: `fadeInUp 0.5s ease ${i * 0.07}s forwards` }}
            >
              <PostCard {...post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
