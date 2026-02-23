import { NewsFeed } from "@/components/NewsFeed";
import logoVoley from "@/assets/logo_voley.jpg";
import logoPatin from "@/assets/logo_patin.jpg";
import logoBasquet from "@/assets/logo_basquet.jpg";
import logoPadel from "@/assets/logo_padel.jpg";

const categoriaMap: Record<string, { title: string; cat: string; logo: string }> = {
  voley: { title: "Vóley", cat: "Vóley", logo: logoVoley },
  patin: { title: "Patín", cat: "Patín", logo: logoPatin },
  basquet: { title: "Básquet", cat: "Básquet", logo: logoBasquet },
  padel: { title: "Pádel", cat: "Pádel", logo: logoPadel },
};

export function DeportePage({ deporte }: { deporte: string }) {
  const info = categoriaMap[deporte];
  if (!info) return null;
  return <NewsFeed title={info.title} categoria={info.cat} logoSrc={info.logo} />;
}
