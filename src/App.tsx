import { useState } from "react";
import { Map3D, type MarkerData } from "./components/mapa3d/Map3D";
import maplibregl from "maplibre-gl";

function App() {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [enableTerrain, setEnableTerrain] = useState(true);
  const [enableBuildings, setEnableBuildings] = useState(true);
  const [showSatellite, setShowSatellite] = useState(false);
  const [styleUrl, setStyleUrl] = useState("https://tiles.openfreemap.org/styles/liberty");
  
  const [selectedPlace, setSelectedPlace] = useState<MarkerData | null>(null);
  const [currentCity, setCurrentCity] = useState("Huancayo");

  // Localizaciones de demostración
  const locations = {
    huancayo: {
      name: "Huancayo, Perú",
      desc: "Plaza de la Constitución y Catedral con marcadores interactivos",
      center: [-75.2101, -12.0673] as [number, number],
      zoom: 17.5,
      pitch: 58,
      bearing: 25,
    },
    nyc: {
      name: "Nueva York, EUA",
      desc: "Excelente para visualizar edificios 3D extruidos",
      center: [-74.006, 40.7128] as [number, number],
      zoom: 15.8,
      pitch: 65,
      bearing: -17,
    },
    canyon: {
      name: "Gran Cañón, EUA",
      desc: "Ideal para apreciar el relieve y terreno 3D",
      center: [-112.1129, 36.1069] as [number, number],
      zoom: 12.5,
      pitch: 75,
      bearing: 45,
    },
  };

  // Marcadores de prueba en Huancayo, Perú
  const demoMarkers: MarkerData[] = [
    {
      id: "plaza-constitucion",
      title: "Plaza de la Constitución",
      coordinates: [-75.2101, -12.0673],
      description: "Plaza histórica rodeada de tiendas y restaurantes, con una hermosa fuente, bancas y vista directa a la catedral de la ciudad.",
      category: "EXPLORAR",
      websiteUrl: "https://es.wikipedia.org/wiki/Plaza_de_la_Constituci%C3%B3n_(Huancayo)",
    },
    {
      id: "catedral-huancayo",
      title: "Catedral de Huancayo",
      coordinates: [-75.2098, -12.0676],
      description: "Templo de la Inmaculada Concepción, una hermosa iglesia de estilo neoclásico que data de la época colonial del siglo XVIII.",
      category: "TURISMO",
      // Imagen representativa del templo (usando una de Wikimedia libre)
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Catedral_de_Huancayo.JPG/400px-Catedral_de_Huancayo.JPG",
      websiteUrl: "https://es.wikipedia.org/wiki/Catedral_de_Huancayo",
    }
  ];

  const handleFlyTo = (key: keyof typeof locations, cityName: string) => {
    if (!map) return;
    const loc = locations[key];
    setCurrentCity(cityName);
    setSelectedPlace(null); // Limpiar popup al cambiar de ciudad
    map.flyTo({
      center: loc.center,
      zoom: loc.zoom,
      pitch: loc.pitch,
      bearing: loc.bearing,
      essential: true,
      duration: 3500,
    });
  };

  const handleStyleChange = (type: "mapa" | "oscuro" | "satelite") => {
    if (type === "mapa") {
      setStyleUrl("https://tiles.openfreemap.org/styles/liberty");
      setShowSatellite(false);
    } else if (type === "oscuro") {
      setStyleUrl("https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json");
      setShowSatellite(false);
    } else if (type === "satelite") {
      setShowSatellite(true);
    }
  };

  const handleMarkerClick = (marker: MarkerData) => {
    setSelectedPlace(marker);
    if (map) {
      map.easeTo({
        center: marker.coordinates,
        zoom: 18,
        duration: 1200
      });
    }
  };

  const handleNextPlace = (currentPlace: MarkerData) => {
    const currentIndex = demoMarkers.findIndex(m => m.id === currentPlace.id);
    const nextIndex = (currentIndex + 1) % demoMarkers.length;
    handleMarkerClick(demoMarkers[nextIndex]);
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", backgroundColor: "#0b0f19" }}>
      {/* Componente del Mapa 3D */}
      <Map3D
        styleUrl={styleUrl}
        showSatellite={showSatellite}
        enableTerrain={enableTerrain}
        enable3DBuildings={enableBuildings}
        markers={demoMarkers}
        selectedPlace={selectedPlace}
        onMarkerClick={handleMarkerClick}
        onClosePopup={() => setSelectedPlace(null)}
        onNextPopup={handleNextPlace}
        onMapLoad={(mapInstance) => setMap(mapInstance)}
        // Inicializar en Huancayo para mostrar los nuevos marcadores directamente
        initialCenter={locations.huancayo.center}
        initialZoom={locations.huancayo.zoom}
        initialPitch={locations.huancayo.pitch}
        initialBearing={locations.huancayo.bearing}
      />

      {/* 1. Panel de Configuración Lateral (Glassmorphism) */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: "320px",
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          padding: "20px",
          color: "#f8fafc",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
          fontFamily: "Inter, sans-serif",
          zIndex: 10,
        }}
      >
        {/* Cabecera */}
        <div style={{ marginBottom: "16px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.15rem",
              fontWeight: 700,
              background: "linear-gradient(90deg, #38bdf8, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Navegación 3D
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>
            Explora relieves, edificios e info de lugares
          </p>
        </div>

        {/* Capas y Opciones */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px", marginBottom: "16px" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>
            Configuración
          </h3>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <label htmlFor="terrain-toggle" style={{ fontSize: "0.85rem", color: "#cbd5e1", cursor: "pointer" }}>Relieve 3D (Terreno)</label>
            <input
              id="terrain-toggle"
              type="checkbox"
              checked={enableTerrain}
              onChange={(e) => setEnableTerrain(e.target.checked)}
              style={{ width: "38px", height: "18px", cursor: "pointer", accentColor: "#6366f1" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label htmlFor="buildings-toggle" style={{ fontSize: "0.85rem", color: "#cbd5e1", cursor: "pointer" }}>Edificios 3D (Extrusión)</label>
            <input
              id="buildings-toggle"
              type="checkbox"
              disabled={showSatellite} // Se deshabilita en satélite
              checked={enableBuildings && !showSatellite}
              onChange={(e) => setEnableBuildings(e.target.checked)}
              style={{ width: "38px", height: "18px", cursor: "pointer", accentColor: "#6366f1", opacity: showSatellite ? 0.5 : 1 }}
            />
          </div>
        </div>

        {/* Destinos */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>
            Volar a Destinos
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { key: "huancayo", label: "🇵🇪 Huancayo, Perú", desc: "Plaza principal y catedral", tag: "Huancayo" },
              { key: "nyc", label: "🇺🇸 Manhattan, Nueva York", desc: "Edificios de gran altura", tag: "Nueva York" },
              { key: "canyon", label: "🇺🇸 Gran Cañón, Colorado", desc: "Montañas y relieves 3D", tag: "Gran Cañón" }
            ].map(dest => (
              <button
                key={dest.key}
                onClick={() => handleFlyTo(dest.key as keyof typeof locations, dest.tag)}
                style={{
                  textAlign: "left",
                  backgroundColor: currentCity === dest.tag ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                  border: currentCity === dest.tag ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  color: "#f1f5f9",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.8rem" }}>{dest.label}</div>
                <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: "1px" }}>{dest.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Selector de Capas / Estilos (Bottom-Left) */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
          left: "20px",
          display: "flex",
          gap: "10px",
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(8px)",
          padding: "8px",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
          zIndex: 10,
        }}
      >
        {[
          {
            id: "mapa",
            label: "Mapa",
            bg: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
            active: !showSatellite && styleUrl.includes("liberty"),
          },
          {
            id: "satelite",
            label: "Satélite",
            bg: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
            active: showSatellite,
          },
          {
            id: "oscuro",
            label: "Oscuro",
            bg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            active: !showSatellite && styleUrl.includes("dark"),
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleStyleChange(item.id as "mapa" | "oscuro" | "satelite")}
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "8px",
              background: item.bg,
              border: item.active ? "2.5px solid #6366f1" : "1.5px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textShadow: "0 1px 3px rgba(0,0,0,0.8)",
              transition: "transform 0.15s ease",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
