import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CommentsSection } from "@/components/CommentsSection";

interface PostCardProps {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: string;
  imagen_url: string | null;
  video_url: string | null;
  fecha: string;
}

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

const categoryColors: Record<string, string> = {
  "Fútbol":  "#CC1E1E",
  "Vóley":   "#1E6BCC",
  "Patín":   "#CC7A1E",
  "Básquet": "#CC1E1E",
  "Pádel":   "#1ECC6B",
};

export function PostCard({ id, titulo, descripcion, categoria, imagen_url, video_url, fecha }: PostCardProps) {
  const ytId = video_url ? getYouTubeId(video_url) : null;
  const catColor = categoryColors[categoria] ?? "#CC1E1E";

  return (
    <article
      className="post-card-club animate-fade-in-up flex flex-col"
      style={{ borderTopColor: catColor }}
    >
      {/* Media */}
      {ytId ? (
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : imagen_url ? (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={imagen_url}
            alt={titulo}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-video w-full flex items-center justify-center"
          style={{ background: "rgba(204,30,30,0.05)" }}>
          <div className="text-4xl opacity-10 font-black" style={{ fontFamily: "'Bebas Neue', sans-serif", color: catColor }}>
            {categoria}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-2.5 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className="badge-club"
            style={{ background: catColor }}
          >
            {categoria}
          </span>
          <time className="text-xs text-white/35" style={{ fontFamily: "'Barlow', sans-serif" }}>
            {format(new Date(fecha), "d MMM yyyy", { locale: es })}
          </time>
        </div>

        <h3
          className="text-base font-semibold leading-snug text-white/90"
          style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.02em" }}
        >
          {titulo}
        </h3>

        {descripcion && (
          <p className="text-sm text-white/50 line-clamp-3 leading-relaxed">
            {descripcion}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Comments */}
      <CommentsSection publicacionId={id} />
    </article>
  );
}
