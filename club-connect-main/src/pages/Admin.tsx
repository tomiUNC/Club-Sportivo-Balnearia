import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import {
  Shield,
  Upload,
  Video,
  Link as LinkIcon,
  X,
  Loader2,
  Users,
  Newspaper,
  Lock,
  UserCog,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { UserManagement } from "@/components/UserManagement";

const categorias = ["Fútbol", "Vóley", "Patín", "Básquet", "Pádel"];

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "2px",
  color: "white",
  fontFamily: "'Barlow', sans-serif",
  width: "100%",
  padding: "0.6rem 0.75rem",
  fontSize: "0.875rem",
  outline: "none",
};

// ──────────────────────────────────────────────────────────────
// Bootstrap panel: shown when user is logged-in but NOT admin
// ──────────────────────────────────────────────────────────────
function BootstrapPanel({
  userEmail,
  hasAnyAdmin,
  onBootstrap,
  bootstrapping,
}: {
  userEmail: string;
  hasAnyAdmin: boolean;
  onBootstrap: () => void;
  bootstrapping: boolean;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 flex flex-col items-center gap-6 animate-fade-in-up">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-sm"
        style={{ background: "rgba(204,30,30,0.12)", border: "1px solid rgba(204,30,30,0.3)" }}
      >
        {hasAnyAdmin ? (
          <Lock className="h-7 w-7" style={{ color: "#CC1E1E" }} />
        ) : (
          <UserCog className="h-7 w-7" style={{ color: "#CC1E1E" }} />
        )}
      </div>

      {hasAnyAdmin ? (
        // Admins exist but this user is not one
        <>
          <div className="text-center space-y-2">
            <h2
              className="text-2xl text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.08em" }}
            >
              Acceso restringido
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Barlow', sans-serif" }}
            >
              Este panel es exclusivo para administradores.
              <br />
              Contactá a un administrador para obtener acceso.
            </p>
          </div>
          <div
            className="w-full rounded-sm px-4 py-3 text-sm text-center"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            Tu email:{" "}
            <span className="text-white font-medium">{userEmail}</span>
          </div>
        </>
      ) : (
        // No admins exist — show first-time setup
        <>
          <div className="text-center space-y-2">
            <h2
              className="text-2xl text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.08em" }}
            >
              Configuración inicial
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Barlow', sans-serif" }}
            >
              No hay administradores configurados todavía.
              <br />
              Podés convertirte en el primer administrador del sistema.
            </p>
          </div>

          <div
            className="w-full rounded-sm px-4 py-3 space-y-1"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Oswald', sans-serif" }}
            >
              Tu cuenta
            </p>
            <p
              className="text-sm text-white font-medium"
              style={{ fontFamily: "'Barlow', sans-serif" }}
            >
              {userEmail}
            </p>
          </div>

          <button
            onClick={onBootstrap}
            disabled={bootstrapping}
            className="w-full py-3 text-sm font-bold uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all"
            style={{
              fontFamily: "'Oswald', sans-serif",
              background: bootstrapping ? "rgba(204,30,30,0.5)" : "#CC1E1E",
              borderRadius: "2px",
              letterSpacing: "0.15em",
            }}
          >
            {bootstrapping ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Configurando...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Convertirme en administrador
              </>
            )}
          </button>

          <p
            className="text-xs text-center"
            style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Barlow', sans-serif" }}
          >
            Esta opción solo está disponible cuando no existe ningún administrador.
          </p>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main Admin component
// ──────────────────────────────────────────────────────────────
const Admin = () => {
  const { user, isAdmin, loading } = useAuth();

  // Bootstrap state (used only when user is logged-in but not admin)
  const [hasAnyAdmin, setHasAnyAdmin] = useState<boolean | null>(null);
  const [bootstrapping, setBootstrapping] = useState(false);

  // Publish form state
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [videoMode, setVideoMode] = useState<"link" | "upload">("link");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // When the user is authenticated but not admin, check if any admin exists
  useEffect(() => {
    if (!loading && user && !isAdmin) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).rpc("has_any_admin").then(
        ({ data }: { data: boolean | null }) => {
          setHasAnyAdmin(!!data);
        }
      );
    }
  }, [loading, user, isAdmin]);

  // ── Routing guards ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#CC1E1E" }} />
      </div>
    );
  }

  // Not logged in → go to auth page
  if (!user) return <Navigate to="/" replace />;

  // Logged in but not admin → show bootstrap or access-denied panel
  if (!isAdmin) {
    // Still checking whether any admin exists
    if (hasAnyAdmin === null) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#CC1E1E" }} />
        </div>
      );
    }

    const handleBootstrap = async () => {
      setBootstrapping(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).rpc("bootstrap_first_admin");
        if (error) throw error;
        const result = data as { success: boolean; message: string };
        if (!result.success) throw new Error(result.message);
        toast({ title: "¡Éxito!", description: result.message });
        // Reload so useAuth re-checks the admin role
        window.location.reload();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        toast({ title: "Error", description: message, variant: "destructive" });
      } finally {
        setBootstrapping(false);
      }
    };

    return (
      <BootstrapPanel
        userEmail={user.email ?? ""}
        hasAnyAdmin={hasAnyAdmin}
        onBootstrap={handleBootstrap}
        bootstrapping={bootstrapping}
      />
    );
  }

  // ── Publish helpers ─────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoFileName(file.name);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearVideoFile = () => {
    setVideoFile(null);
    setVideoFileName("");
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const resetForm = () => {
    setTitulo("");
    setDescripcion("");
    setCategoria("");
    setVideoUrl("");
    setVideoMode("link");
    clearImage();
    clearVideoFile();
  };

  const handlePublish = async () => {
    if (!titulo.trim() || !categoria) {
      toast({
        title: "Error",
        description: "Título y categoría son obligatorios.",
        variant: "destructive",
      });
      return;
    }
    setPublishing(true);
    let imagen_url: string | null = null;
    let video_url: string | null = null;

    try {
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("publicaciones")
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("publicaciones")
          .getPublicUrl(filePath);
        imagen_url = urlData.publicUrl;
      }

      if (videoMode === "link" && videoUrl.trim()) {
        video_url = videoUrl.trim();
      } else if (videoMode === "upload" && videoFile) {
        const ext = videoFile.name.split(".").pop();
        const filePath = `videos/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("publicaciones")
          .upload(filePath, videoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("publicaciones")
          .getPublicUrl(filePath);
        video_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("publicaciones").insert({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        categoria,
        imagen_url,
        video_url,
        user_id: user.id,
      });
      if (error) throw error;

      toast({ title: "¡Publicado!", description: "La noticia se publicó correctamente." });
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast({ title: "Error al publicar", description: message, variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };

  // ── Full admin panel ────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-sm"
          style={{ background: "#CC1E1E" }}
        >
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1
            className="text-3xl font-black text-white leading-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.06em" }}
          >
            Panel de Administración
          </h1>
          <div
            className="h-px w-32 mt-1.5"
            style={{ background: "linear-gradient(90deg, #CC1E1E, transparent)" }}
          />
        </div>
      </div>

      <Tabs defaultValue="publicar" className="space-y-5">
        <TabsList
          className="grid w-full grid-cols-2 p-0 h-auto gap-0"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "2px",
          }}
        >
          {[
            { value: "publicar", label: "Publicar Noticia", Icon: Newspaper },
            { value: "usuarios", label: "Gestión de Usuarios", Icon: Users },
          ].map(({ value, label, Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-2 py-2.5 rounded-none text-xs font-semibold uppercase tracking-widest data-[state=active]:text-white data-[state=active]:shadow-none"
              style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.1em" }}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Publicar */}
        <TabsContent value="publicar">
          <div
            className="rounded-sm p-6 space-y-5"
            style={{
              background: "rgba(14,14,14,0.92)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderTop: "2px solid #CC1E1E",
            }}
          >
            <h2
              className="text-lg font-bold text-white"
              style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}
            >
              Nueva Publicación
            </h2>

            <div className="space-y-1.5">
              <label
                className="text-xs uppercase tracking-widest text-white/40"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Título *
              </label>
              <input
                style={inputStyle}
                placeholder="Título de la noticia"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor = "#CC1E1E")
                }
                onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    "rgba(255,255,255,0.1)")
                }
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs uppercase tracking-widest text-white/40"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Texto
              </label>
              <Textarea
                placeholder="Escribí el cuerpo de la noticia..."
                rows={5}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="resize-none text-sm text-white placeholder-white/20 outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "2px",
                  fontFamily: "'Barlow', sans-serif",
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs uppercase tracking-widest text-white/40"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Categoría *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={(e) =>
                  ((e.target as HTMLSelectElement).style.borderColor = "#CC1E1E")
                }
                onBlur={(e) =>
                  ((e.target as HTMLSelectElement).style.borderColor =
                    "rgba(255,255,255,0.1)")
                }
              >
                <option value="" style={{ background: "#111" }}>
                  Seleccioná un deporte
                </option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat} style={{ background: "#111" }}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Imagen */}
            <div className="space-y-1.5">
              <label
                className="text-xs uppercase tracking-widest text-white/40"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Foto
              </label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-40 w-auto rounded-sm border object-cover"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }}
                  />
                  <button
                    onClick={clearImage}
                    className="absolute -right-2 -top-2 rounded-sm p-1"
                    style={{ background: "#CC1E1E" }}
                  >
                    <X className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-28 w-full items-center justify-center gap-2 text-sm transition-all"
                  style={{
                    border: "2px dashed rgba(255,255,255,0.1)",
                    borderRadius: "2px",
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "'Oswald', sans-serif",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).closest("button")!.style.borderColor =
                      "#CC1E1E";
                    (e.target as HTMLElement).closest("button")!.style.color = "#CC1E1E";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).closest("button")!.style.borderColor =
                      "rgba(255,255,255,0.1)";
                    (e.target as HTMLElement).closest("button")!.style.color =
                      "rgba(255,255,255,0.3)";
                  }}
                >
                  <Upload className="h-5 w-5" />
                  Subir imagen
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Video */}
            <div className="space-y-2">
              <label
                className="text-xs uppercase tracking-widest text-white/40"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Video
              </label>
              <div className="flex gap-2">
                {[
                  { mode: "link" as const, Icon: LinkIcon, label: "YouTube" },
                  { mode: "upload" as const, Icon: Upload, label: "Archivo" },
                ].map(({ mode, Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setVideoMode(mode);
                      if (mode === "link") clearVideoFile();
                      else setVideoUrl("");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-all"
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      borderRadius: "2px",
                      background:
                        videoMode === mode ? "#CC1E1E" : "rgba(255,255,255,0.05)",
                      color:
                        videoMode === mode ? "white" : "rgba(255,255,255,0.4)",
                      border: "1px solid",
                      borderColor:
                        videoMode === mode ? "#CC1E1E" : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {videoMode === "link" ? (
                <input
                  style={inputStyle}
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onFocus={(e) =>
                    ((e.target as HTMLInputElement).style.borderColor = "#CC1E1E")
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLInputElement).style.borderColor =
                      "rgba(255,255,255,0.1)")
                  }
                />
              ) : (
                <>
                  {videoFileName ? (
                    <div
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <Video className="h-4 w-4 text-white/30" />
                      <span className="truncate flex-1 text-white/60">
                        {videoFileName}
                      </span>
                      <button onClick={clearVideoFile}>
                        <X className="h-4 w-4 text-white/30 hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="flex h-20 w-full items-center justify-center gap-2 text-sm transition-all"
                      style={{
                        border: "2px dashed rgba(255,255,255,0.1)",
                        borderRadius: "2px",
                        color: "rgba(255,255,255,0.3)",
                        fontFamily: "'Oswald', sans-serif",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      <Upload className="h-5 w-5" />
                      Seleccionar video
                    </button>
                  )}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoFileChange}
                  />
                </>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="w-full py-3 text-sm font-bold uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all"
              style={{
                fontFamily: "'Oswald', sans-serif",
                background: publishing ? "rgba(204,30,30,0.5)" : "#CC1E1E",
                borderRadius: "2px",
                letterSpacing: "0.15em",
              }}
            >
              {publishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Publicando...
                </>
              ) : (
                "Publicar Noticia"
              )}
            </button>
          </div>
        </TabsContent>

        {/* Usuarios */}
        <TabsContent value="usuarios">
          <div
            className="rounded-sm p-6 space-y-5"
            style={{
              background: "rgba(14,14,14,0.92)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderTop: "2px solid #CC1E1E",
            }}
          >
            <div className="space-y-1">
              <h2
                className="text-lg font-bold text-white"
                style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}
              >
                Gestión de Usuarios
              </h2>
              <p
                className="text-xs"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                Buscar por email o nombre para encontrar y cambiar el rol de un usuario.
              </p>
            </div>
            <UserManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
