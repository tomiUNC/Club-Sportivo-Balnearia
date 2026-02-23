import { NewsFeed } from "@/components/NewsFeed";
import { useParams } from "react-router-dom";
import logoMayores from "@/assets/logo_mayores.jpg";
import logoFemenino from "@/assets/logo_femenino.jpg";
import logoInferiores from "@/assets/logo_inferiores.jpg";

const subcategorias: Record<string, { label: string; logo: string }> = {
  "primera-reserva": { label: "Primera y reserva", logo: logoMayores },
  "femenino": { label: "Femenino", logo: logoFemenino },
  "inferiores": { label: "Inferiores", logo: logoInferiores },
};

const FutbolPage = () => {
  const { sub } = useParams();
  const subInfo = sub ? subcategorias[sub] : undefined;

  return (
    <NewsFeed
      title={subInfo ? `Fútbol — ${subInfo.label}` : "Fútbol"}
      categoria="Fútbol"
      logoSrc={subInfo?.logo ?? logoMayores}
    />
  );
};

export default FutbolPage;
