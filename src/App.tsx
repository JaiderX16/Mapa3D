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
  const [activeKey, setActiveKey] = useState<string>("huancayo");

  // Interfaz para definir un destino icónico
  interface Destination {
    key: string;
    name: string;
    label: string;
    desc: string;
    tag: string;
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
    markers: MarkerData[];
  }

  const destinations: Destination[] = [
    {
      key: "huancayo",
      name: "Huancayo, Perú",
      label: "🇵🇪 Huancayo, Perú",
      desc: "Plaza de la Constitución y Catedral",
      tag: "Huancayo",
      center: [-75.2101, -12.0673],
      zoom: 17.5,
      pitch: 58,
      bearing: 25,
      markers: [
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Catedral_de_Huancayo.JPG/400px-Catedral_de_Huancayo.JPG",
          websiteUrl: "https://es.wikipedia.org/wiki/Catedral_de_Huancayo",
        }
      ]
    },
    {
      key: "paris",
      name: "Torre Eiffel, París",
      label: "🇫🇷 Torre Eiffel, París",
      desc: "Icono de la arquitectura de hierro de 1889",
      tag: "París",
      center: [2.2945, 48.8584],
      zoom: 17.0,
      pitch: 60,
      bearing: 30,
      markers: [
        {
          id: "eiffel-tower",
          title: "Torre Eiffel",
          coordinates: [2.2945, 48.8584],
          description: "Construida por Gustave Eiffel para la Exposición Universal de 1889, esta estructura de hierro de 330 metros es el símbolo de París y uno de los monumentos más visitados del mundo.",
          category: "TURISMO",
          imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
          websiteUrl: "https://es.wikipedia.org/wiki/Torre_Eiffel",
        }
      ]
    },
    {
      key: "roma",
      name: "Coliseo Romano, Roma",
      label: "🇮🇹 Coliseo Romano, Roma",
      desc: "El anfiteatro más grande del Imperio Romano",
      tag: "Roma",
      center: [12.4922, 41.8902],
      zoom: 16.8,
      pitch: 58,
      bearing: -20,
      markers: [
        {
          id: "colosseum",
          title: "Coliseo Romano",
          coordinates: [12.4922, 41.8902],
          description: "Construido en el siglo I d.C., este colosal anfiteatro albergaba luchas de gladiadores y espectáculos públicos, siendo una de las nuevas siete maravillas del mundo moderno.",
          category: "HISTORIA",
          imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
          websiteUrl: "https://es.wikipedia.org/wiki/Coliseo_de_Roma",
        }
      ]
    },
    {
      key: "libertad",
      name: "Estatua de la Libertad, Nueva York",
      label: "🇺🇸 Est. de la Libertad, NY",
      desc: "Símbolo de la libertad y la democracia",
      tag: "Nueva York",
      center: [-74.0445, 40.6892],
      zoom: 16.8,
      pitch: 60,
      bearing: -40,
      markers: [
        {
          id: "statue-of-liberty",
          title: "Estatua de la Libertad",
          coordinates: [-74.0445, 40.6892],
          description: "Inaugurada en 1886, fue un regalo del pueblo de Francia a los Estados Unidos para conmemorar el centenario de su declaración de independencia y como signo de amistad.",
          category: "MONUMENTO",
          imageUrl: "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=600&q=80",
          websiteUrl: "https://es.wikipedia.org/wiki/Estatua_de_la_Libertad",
        }
      ]
    },
    {
      key: "taj-mahal",
      name: "Taj Mahal, Agra",
      label: "🇮🇳 Taj Mahal, Agra",
      desc: "El mayor monumento al amor eterno",
      tag: "Agra",
      center: [78.0421, 27.1750],
      zoom: 17.2,
      pitch: 55,
      bearing: 0,
      markers: [
        {
          id: "taj-mahal",
          title: "Taj Mahal",
          coordinates: [78.0421, 27.1750],
          description: "Imponente mausoleo de mármol blanco construido entre 1631 y 1648 por orden del emperador Shah Jahan en memoria de su esposa favorita, Mumtaz Mahal. Joya del arte musulmán.",
          category: "MARAVILLA",
          imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
          websiteUrl: "https://es.wikipedia.org/wiki/Taj_Mahal",
        }
      ]
    },
    {
      key: "giza",
      name: "Pirámides de Giza, El Cairo",
      label: "🇪🇬 Pirámides de Giza",
      desc: "La única maravilla del mundo antiguo en pie",
      tag: "El Cairo",
      center: [31.1342, 29.9792],
      zoom: 16.2,
      pitch: 52,
      bearing: -45,
      markers: [
        {
          id: "giza-pyramid",
          title: "Gran Pirámide de Giza",
          coordinates: [31.1342, 29.9792],
          description: "Construida para el faraón Keops de la cuarta dinastía del antiguo Egipto alrededor del 2560 a.C. Es la más antigua de las siete maravillas del mundo antiguo.",
          category: "HISTORIA",
          imageUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80",
          websiteUrl: "https://es.wikipedia.org/wiki/Gran_Pir%C3%A1mide_de_Guiza",
        }
      ]
    },
    {
      key: "kyoto",
      name: "Pabellón Dorado (Kinkaku-ji), Kioto",
      label: "🇯🇵 Pabellón Dorado, Kioto",
      desc: "Templo zen recubierto de pan de oro puro",
      tag: "Kioto",
      center: [135.7292, 35.0394],
      zoom: 17.5,
      pitch: 50,
      bearing: -30,
      markers: [
        {
          id: "kinkaku-ji",
          title: "Pabellón de Oro (Kinkaku-ji)",
          coordinates: [135.7292, 35.0394],
          description: "Templo budista zen en Kioto donde las dos plantas superiores están completamente recubiertas con hojas de oro puro, rodeado de un exquisito jardín japonés.",
          category: "CULTURA",
          imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
          websiteUrl: "https://es.wikipedia.org/wiki/Kinkaku-ji",
        }
      ]
    },
    {
      key: "sydney",
      name: "Ópera de Sídney, Sídney",
      label: "🇦🇺 Ópera de Sídney, Sídney",
      desc: "Arquitectura expresionista moderna",
      tag: "Sídney",
      center: [151.2153, -33.8568],
      zoom: 16.5,
      pitch: 58,
      bearing: -45,
      markers: [
        {
          id: "sydney-opera-house",
          title: "Ópera de Sídney",
          coordinates: [151.2153, -33.8568],
          description: "Diseñado por el arquitecto danés Jørn Utzon e inaugurado en 1973, este teatro es famoso por su estructura de conchas superpuestas en el puerto de Sídney.",
          category: "ARTE",
          imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80",
          websiteUrl: "https://es.wikipedia.org/wiki/%C3%93pera_de_S%C3%ADdney",
        }
      ]
    },
    {
      key: "machu-picchu",
      name: "Machu Picchu, Cusco",
      label: "🇵🇪 Machu Picchu, Cusco",
      desc: "Ciudadela inca en la cima de los Andes",
      tag: "Machu Picchu",
      center: [-72.5450, -13.1631],
      zoom: 15.5,
      pitch: 62,
      bearing: 45,
      markers: [
        {
          id: "machu-picchu",
          title: "Santuario de Machu Picchu",
          coordinates: [-72.5450, -13.1631],
          description: "Antiguo poblado andino incaico construido a mediados del siglo XV, ubicado en una cadena montañosa a 2,430 metros sobre el nivel del mar, obra maestra de la arquitectura.",
          category: "MARAVILLA",
          imageUrl: "https://images.unsplash.com/photo-1587590227264-0ac64ce63ce8?auto=format&fit=crop&w=600&q=80",
          websiteUrl: "https://es.wikipedia.org/wiki/Machu_Picchu",
        }
      ]
    },
    {
      key: "london",
      name: "Big Ben, Londres",
      label: "🇬🇧 Big Ben, Londres",
      desc: "El famoso reloj de la Elizabeth Tower",
      tag: "Londres",
      center: [-0.1246, 51.5007],
      zoom: 17.2,
      pitch: 55,
      bearing: 25,
      markers: [
        {
          id: "big-ben",
          title: "Torre del Reloj (Big Ben)",
          coordinates: [-0.1246, 51.5007],
          description: "La Elizabeth Tower, conocida popularmente como Big Ben, es la icónica torre del reloj del Palacio de Westminster. Es el reloj de cuatro caras más grande y preciso del mundo.",
          category: "TURISMO",
          imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80",
          websiteUrl: "https://es.wikipedia.org/wiki/Big_Ben",
        }
      ]
    },
    {
      key: "canyon",
      name: "Gran Cañón, Colorado",
      label: "🇺🇸 Gran Cañón, Colorado",
      desc: "Increíble relieve y garganta natural",
      tag: "Gran Cañón",
      center: [-112.1129, 36.1069],
      zoom: 12.5,
      pitch: 75,
      bearing: 45,
      markers: [
        {
          id: "grand-canyon",
          title: "Gran Cañón del Colorado",
          coordinates: [-112.1129, 36.1069],
          description: "Una vistosa y escarpada garganta excavada por el río Colorado a lo largo de millones de años en el norte de Arizona, ofreciendo espectaculares relieves 3D.",
          category: "PAISAJE",
          imageUrl: "https://images.unsplash.com/photo-1615551043360-33de8b5f410c?auto=format&fit=crop&w=600&q=80",
          websiteUrl: "https://es.wikipedia.org/wiki/Gran_Ca%C3%B1%C3%B3n",
        }
      ]
    }
  ];

  const activeDestination = destinations.find(d => d.key === activeKey) || destinations[0];

  const handleFlyTo = (key: string) => {
    if (!map) return;
    const loc = destinations.find(d => d.key === key);
    if (!loc) return;
    setActiveKey(key);
    setSelectedPlace(null); // Limpiar popup al cambiar de ciudad
    map.flyTo({
      center: loc.center as [number, number],
      zoom: loc.zoom,
      pitch: loc.pitch,
      bearing: loc.bearing,
      essential: true,
      duration: 3500,
    });

    // Auto-seleccionar el primer marcador del destino después de volar
    setTimeout(() => {
      if (loc.markers.length > 0) {
        setSelectedPlace(loc.markers[0]);
      }
    }, 3600);
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
    const markers = activeDestination.markers;
    const currentIndex = markers.findIndex(m => m.id === currentPlace.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % markers.length;
    handleMarkerClick(markers[nextIndex]);
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", backgroundColor: "#0b0f19" }}>
      {/* Componente del Mapa 3D */}
      <Map3D
        styleUrl={styleUrl}
        showSatellite={showSatellite}
        enableTerrain={enableTerrain}
        enable3DBuildings={enableBuildings}
        markers={activeDestination.markers}
        selectedPlace={selectedPlace}
        onMarkerClick={handleMarkerClick}
        onClosePopup={() => setSelectedPlace(null)}
        onNextPopup={handleNextPlace}
        onMapLoad={(mapInstance) => setMap(mapInstance)}
        initialCenter={destinations[0].center as [number, number]}
        initialZoom={destinations[0].zoom}
        initialPitch={destinations[0].pitch}
        initialBearing={destinations[0].bearing}
      />

      {/* 1. Panel de Configuración Lateral (Glassmorphism) */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: "320px",
          maxHeight: "calc(100vh - 40px)",
          display: "flex",
          flexDirection: "column",
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
          boxSizing: "border-box"
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
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>
            Volar a Destinos
          </h3>

          <div
            className="destinations-scroll"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              overflowY: "auto",
              paddingRight: "4px",
              flex: 1
            }}
          >
            {destinations.map(dest => (
              <button
                key={dest.key}
                onClick={() => handleFlyTo(dest.key)}
                style={{
                  textAlign: "left",
                  backgroundColor: activeKey === dest.key ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                  border: activeKey === dest.key ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.06)",
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
