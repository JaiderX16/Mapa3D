import { useEffect, useRef, useState } from "react";
import type maplibregl from "maplibre-gl";
import { Map3D, type MarkerData } from "./components/mapa3d/Map3D";
import { DESTINATIONS, type Destination } from "./data/destinations";
import "./App.css";

const STYLE_URLS = {
  mapa: "https://tiles.openfreemap.org/styles/liberty",
  oscuro: "https://tiles.openfreemap.org/styles/dark",
};

type MapMode = "mapa" | "satelite" | "oscuro";

const MAP_MODES: { id: MapMode; label: string }[] = [
  { id: "mapa", label: "Mapa" },
  { id: "satelite", label: "Satélite" },
  { id: "oscuro", label: "Oscuro" },
];

const INITIAL_DESTINATION = DESTINATIONS[0];
const FLIGHT_DURATION = 3500;
// En pantallas estrechas el panel tapa el mapa (ver App.css)
const MOBILE_QUERY = "(max-width: 767px)";

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

function App() {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [enableTerrain, setEnableTerrain] = useState(true);
  const [enableBuildings, setEnableBuildings] = useState(true);
  const [showSatellite, setShowSatellite] = useState(false);
  const [styleUrl, setStyleUrl] = useState(STYLE_URLS.mapa);

  const [selectedPlace, setSelectedPlace] = useState<MarkerData | null>(null);
  const [activeKey, setActiveKey] = useState(INITIAL_DESTINATION.key);
  const [isOpen, setIsOpen] = useState(true);

  // Identificador del último movimiento de cámara pedido: permite descartar
  // la auto-selección de un vuelo que el usuario ya reemplazó por otro.
  const flightIdRef = useRef(0);
  const destinationsListRef = useRef<HTMLDivElement>(null);
  const activeDestinationRef = useRef<HTMLButtonElement>(null);

  const activeDestination = DESTINATIONS.find(d => d.key === activeKey) ?? INITIAL_DESTINATION;
  const mapMode: MapMode = showSatellite ? "satelite" : styleUrl === STYLE_URLS.oscuro ? "oscuro" : "mapa";

  // Cerrar el popup con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPlace(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mantener visible en la lista el destino activo (p. ej. al avanzar con "Siguiente lugar")
  useEffect(() => {
    const list = destinationsListRef.current;
    const item = activeDestinationRef.current;
    if (!list || !item) return;
    const top = item.offsetTop - list.offsetTop;
    const bottom = top + item.offsetHeight;
    if (top < list.scrollTop) {
      list.scrollTo({ top, behavior: "smooth" });
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: bottom - list.clientHeight, behavior: "smooth" });
    }
  }, [activeKey]);

  const handleFlyTo = (dest: Destination) => {
    if (!map) return;
    const flightId = ++flightIdRef.current;
    setActiveKey(dest.key);
    setSelectedPlace(null); // Limpiar popup al cambiar de ciudad
    map.flyTo({
      center: dest.center,
      zoom: dest.zoom,
      pitch: dest.pitch,
      bearing: dest.bearing,
      essential: true,
      duration: FLIGHT_DURATION,
    });

    // Auto-seleccionar el primer marcador del destino al aterrizar,
    // salvo que mientras tanto se haya pedido otro vuelo o se haya elegido otro marcador
    map.once("moveend", () => {
      if (flightIdRef.current === flightId && dest.markers.length > 0) {
        setSelectedPlace(dest.markers[0]);
      }
    });

    if (window.matchMedia(MOBILE_QUERY).matches) {
      setIsOpen(false);
    }
  };

  const handleModeChange = (mode: MapMode) => {
    if (mode === "satelite") {
      setShowSatellite(true);
      return;
    }
    setStyleUrl(STYLE_URLS[mode]);
    setShowSatellite(false);
  };

  const handleMarkerClick = (marker: MarkerData) => {
    flightIdRef.current++;
    setSelectedPlace(marker);
    map?.easeTo({
      center: marker.coordinates,
      zoom: 18,
      duration: 1200
    });
  };

  // Siguiente marcador del destino; tras el último, vuela al siguiente destino
  const handleNextPlace = (currentPlace: MarkerData) => {
    const { markers } = activeDestination;
    const currentIndex = markers.findIndex(m => m.id === currentPlace.id);
    if (currentIndex !== -1 && currentIndex < markers.length - 1) {
      handleMarkerClick(markers[currentIndex + 1]);
      return;
    }
    const destinationIndex = DESTINATIONS.indexOf(activeDestination);
    handleFlyTo(DESTINATIONS[(destinationIndex + 1) % DESTINATIONS.length]);
  };

  return (
    <div className="app">
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
        onMapLoad={setMap}
        initialCenter={INITIAL_DESTINATION.center}
        initialZoom={INITIAL_DESTINATION.zoom}
        initialPitch={INITIAL_DESTINATION.pitch}
        initialBearing={INITIAL_DESTINATION.bearing}
      />

      {/* Botón flotante para abrir el panel si está cerrado */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`sidebar-toggle-btn${isOpen ? " sidebar-toggle-btn--hidden" : ""}`}
        inert={isOpen}
        title="Abrir Navegación"
        aria-label="Abrir Navegación"
      >
        <MenuIcon />
      </button>

      {/* 1. Panel de Configuración Lateral (Glassmorphism) */}
      <aside
        className={`sidebar-user ${isOpen ? "open" : "closed"}`}
        inert={!isOpen}
        aria-label="Navegación 3D"
      >
        {/* Cabecera con botón de cerrar */}
        <div className="sidebar-header">
          <div>
            <h2 className="sidebar-title">Navegación 3D</h2>
            <p className="sidebar-subtitle">Explora relieves, edificios e info de lugares</p>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            title="Cerrar Navegación"
            aria-label="Cerrar Navegación"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Capas y Opciones */}
        <section className="sidebar-section">
          <h3 className="sidebar-section-title">Configuración</h3>

          <div className="setting-row">
            <label htmlFor="terrain-toggle">Relieve 3D (Terreno)</label>
            <input
              id="terrain-toggle"
              type="checkbox"
              role="switch"
              className="toggle-switch"
              checked={enableTerrain}
              onChange={(e) => setEnableTerrain(e.target.checked)}
            />
          </div>

          <div className="setting-row" title={showSatellite ? "No disponible en modo satélite" : undefined}>
            <label htmlFor="buildings-toggle">Edificios 3D (Extrusión)</label>
            <input
              id="buildings-toggle"
              type="checkbox"
              role="switch"
              className="toggle-switch"
              disabled={showSatellite} // Se deshabilita en satélite
              checked={enableBuildings && !showSatellite}
              onChange={(e) => setEnableBuildings(e.target.checked)}
            />
          </div>

          {/* Selector de Estilos/Capas de Mapa */}
          <div className="style-switcher" role="group" aria-label="Estilo del mapa">
            {MAP_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`style-option style-option--${mode.id}${mapMode === mode.id ? " active" : ""}`}
                aria-pressed={mapMode === mode.id}
                onClick={() => handleModeChange(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </section>

        {/* Destinos */}
        <section className="sidebar-section sidebar-section--grow">
          <h3 className="sidebar-section-title">Volar a Destinos</h3>

          <div className="destinations-scroll" ref={destinationsListRef}>
            {DESTINATIONS.map(dest => (
              <button
                key={dest.key}
                ref={dest.key === activeKey ? activeDestinationRef : undefined}
                type="button"
                className={`destination-btn${dest.key === activeKey ? " active" : ""}`}
                aria-current={dest.key === activeKey ? "true" : undefined}
                title={dest.name}
                onClick={() => handleFlyTo(dest)}
              >
                <div className="destination-label">{dest.label}</div>
                <div className="destination-desc">{dest.desc}</div>
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

export default App;
