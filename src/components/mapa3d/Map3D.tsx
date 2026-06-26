import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import maplibregl from "maplibre-gl";
import { ResetBearingControl } from "./ResetBearingControl";

// Estilos necesarios de MapLibre y de nuestro control de brújula
import "maplibre-gl/dist/maplibre-gl.css";
import "./reset-bearing-control.css";

export interface MarkerData {
  id: string;
  title: string;
  coordinates: [number, number];
  description: string;
  imageUrl?: string;
  isOpen?: boolean;
  category?: string;
  websiteUrl?: string;
}

interface Map3DProps {
  /** URL del estilo del mapa (por ejemplo, de OpenFreeMap, MapTiler, etc.) */
  styleUrl?: string;
  /** Latitud y longitud iniciales del mapa [lng, lat] */
  initialCenter?: [number, number];
  /** Zoom inicial */
  initialZoom?: number;
  /** Inclinación de la cámara (pitch) en grados (0 es vertical, hasta 85 para perspectiva 3D) */
  initialPitch?: number;
  /** Rotación (bearing) de la cámara en grados */
  initialBearing?: number;
  /** Activar/Desactivar el terreno 3D (relieve) */
  enableTerrain?: boolean;
  /** Activar/Desactivar edificios en 3D (fill-extrusion) */
  enable3DBuildings?: boolean;
  /** Activar/Desactivar capa de imagen satelital */
  showSatellite?: boolean;
  /** Lista de marcadores interactivos en el mapa */
  markers?: MarkerData[];
  /** Elemento seleccionado para mostrar el popup flotante sobre su marcador */
  selectedPlace?: MarkerData | null;
  /** Callback cuando se hace click en un marcador */
  onMarkerClick?: (marker: MarkerData) => void;
  /** Callback para cerrar el popup */
  onClosePopup?: () => void;
  /** Callback para ir al siguiente marcador */
  onNextPopup?: (currentPlace: MarkerData) => void;
  /** Callback opcional ejecutado cuando el mapa se carga por completo o cambia de estilo */
  onMapLoad?: (map: maplibregl.Map) => void;
}

// Configuración del terreno 3D (Terrarium de AWS)
const TERRAIN_SOURCE_ID = "raster-dem-terrain";
const TERRAIN_SOURCE: maplibregl.RasterDEMSourceSpecification = {
  type: "raster-dem",
  tiles: [
    "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
  ],
  tileSize: 256,
  maxzoom: 15,
  encoding: "terrarium",
  attribution: 'Terrain tiles by AWS Open Data',
};

// Configuración de la capa Satélite de Esri
const SATELLITE_SOURCE_ID = "esri-satellite-source";
const SATELLITE_LAYER_ID = "esri-satellite-layer";
const SATELLITE_SOURCE: maplibregl.RasterSourceSpecification = {
  type: "raster",
  tiles: [
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  ],
  tileSize: 256,
  attribution: "Tiles &copy; Esri &mdash; Source: Esri",
};

export const Map3D: React.FC<Map3DProps> = ({
  styleUrl = "https://tiles.openfreemap.org/styles/liberty",
  initialCenter = [-74.006, 40.7128],
  initialZoom = 15.5,
  initialPitch = 60,
  initialBearing = -17.6,
  enableTerrain = true,
  enable3DBuildings = true,
  showSatellite = false,
  markers = [],
  selectedPlace = null,
  onMarkerClick,
  onClosePopup,
  onNextPopup,
  onMapLoad,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const popupRootRef = useRef<any>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);

  // Inicializar mapa (una sola vez)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: initialCenter,
      zoom: initialZoom,
      pitch: initialPitch,
      bearing: initialBearing,
      maxPitch: 85,
    });

    mapRef.current = map;
    (window as any).map = map;

    // Manejar carga inicial y re-cargas de estilo
    map.on("style.load", () => {
      // Intentamos configurar proyección de globo
      try {
        map.setProjection({ type: "globe" });
      } catch (e) {
        console.warn("La proyección de globo no está soportada:", e);
      }

      setIsStyleLoaded(true);
      if (onMapLoad) {
        onMapLoad(map);
      }
    });

    // Agregar brújula y navegación clásica
    map.addControl(new maplibregl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: false
    }), "bottom-right");

    map.addControl(new ResetBearingControl(), "bottom-right");

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const isFirstRender = useRef(true);

  // Cambiar estilo dinámicamente si cambia styleUrl
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsStyleLoaded(false);
    map.setStyle(styleUrl);
  }, [styleUrl]);

  // Sincronizar fuentes y capas que dependen del estado del estilo actual
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoaded) return;

    // 1. SATÉLITE (Híbrido)
    if (showSatellite) {
      if (!map.getSource(SATELLITE_SOURCE_ID)) {
        map.addSource(SATELLITE_SOURCE_ID, SATELLITE_SOURCE);
      }
      if (!map.getLayer(SATELLITE_LAYER_ID)) {
        // Para que sea híbrido (Satélite de fondo pero calles y etiquetas vectoriales encima),
        // buscamos la primera capa que sea una calle (line) o texto (symbol) para meter el satélite justo antes.
        const layers = map.getStyle().layers;
        let firstOverlayId = undefined;
        for (const layer of layers) {
          if (layer.type === "line" || layer.type === "symbol") {
            firstOverlayId = layer.id;
            break;
          }
        }
        map.addLayer({
          id: SATELLITE_LAYER_ID,
          type: "raster",
          source: SATELLITE_SOURCE_ID,
          paint: { "raster-opacity": 1 }
        }, firstOverlayId);
      } else {
        map.setLayoutProperty(SATELLITE_LAYER_ID, "visibility", "visible");
      }

      // Limitar zoom máximo para evitar que aparezca el error "Map data not yet available" de Esri en Huancayo
      map.setMaxZoom(17);
      if (map.getZoom() > 17) {
        map.setZoom(17);
      }
    } else {
      if (map.getLayer(SATELLITE_LAYER_ID)) {
        map.setLayoutProperty(SATELLITE_LAYER_ID, "visibility", "none");
      }
      map.setMaxZoom(20); // Permitir zoom máximo normal en modos mapa vectorial
    }

    // 2. TERRENO 3D (Relieve)
    if (enableTerrain) {
      if (!map.getSource(TERRAIN_SOURCE_ID)) {
        map.addSource(TERRAIN_SOURCE_ID, TERRAIN_SOURCE);
      }
      map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: 1.5 });
    } else {
      map.setTerrain(null);
    }

    // 3. EDIFICIOS 3D
    const buildingLayerId = "3d-buildings-extrusion";
    if (enable3DBuildings && !showSatellite) {
      if (!map.getLayer(buildingLayerId)) {
        // Buscar el nombre de la fuente vectorial disponible en el estilo actual
        // (OpenFreeMap usa 'openmaptiles' o 'osm', CartoDB usa 'cartodb')
        const sources = map.getStyle().sources;
        let sourceName = "openmaptiles"; // fallback
        if (sources.openmaptiles) {
          sourceName = "openmaptiles";
        } else if (sources.osm) {
          sourceName = "osm";
        } else if (sources.cartodb) {
          sourceName = "cartodb";
        } else {
          for (const key in sources) {
            if (sources[key].type === "vector") {
              sourceName = key;
              break;
            }
          }
        }

        const isDark = styleUrl.toLowerCase().includes("dark");
        const buildingColors = isDark
          ? [
              "interpolate",
              ["linear"],
              ["coalesce", ["get", "height"], 15],
              0, "#1e293b",       // Edificios muy bajos (slate oscuro)
              20, "#334155",      // Estándar (slate medio)
              50, "#475569",      // Medianos
              150, "#64748b"      // Rascacielos altos
            ]
          : [
              "interpolate",
              ["linear"],
              ["coalesce", ["get", "height"], 15],
              0, "#f3f4f6",       // Edificios muy bajos (gris off-white)
              20, "#e5e7eb",      // Estándar (gris claro)
              50, "#d1d5db",      // Medianos
              150, "#9ca3af"      // Rascacielos altos
            ];

        map.addLayer({
          id: buildingLayerId,
          source: sourceName,
          "source-layer": "building",
          type: "fill-extrusion",
          minzoom: 13,
          paint: {
            "fill-extrusion-color": buildingColors as any,
            "fill-extrusion-height": [
              "coalesce",
              ["get", "render_height"],
              ["get", "height"],
              15
            ],
            "fill-extrusion-base": [
              "coalesce",
              ["get", "render_min_height"],
              ["get", "min_height"],
              0
            ],
            "fill-extrusion-opacity": isDark ? 0.9 : 0.85
          }
        });
      } else {
        map.setLayoutProperty(buildingLayerId, "visibility", "visible");
      }
    } else {
      if (map.getLayer(buildingLayerId)) {
        map.setLayoutProperty(buildingLayerId, "visibility", "none");
      }
    }

    // Asegurar proyección de globo después de mutaciones del estilo
    try {
      map.setProjection({ type: "globe" });
    } catch (e) {
      console.warn("La proyección de globo no está soportada en el sync effect:", e);
    }
  }, [isStyleLoaded, showSatellite, enableTerrain, enable3DBuildings, styleUrl]);

  // Sincronizar Marcadores
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoaded) return;

    // Limpiar marcadores antiguos
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Crear nuevos marcadores
    markers.forEach(item => {
      const el = document.createElement("div");
      
      if (item.imageUrl) {
        // Avatar circular
        el.className = "custom-marker-avatar";
        el.style.backgroundImage = `url(${item.imageUrl})`;
      } else {
        // Punto rojo pulsante
        el.className = "custom-marker-red-dot";
      }

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (onMarkerClick) {
          onMarkerClick(item);
        }
      });

      const markerInstance = new maplibregl.Marker({ element: el })
        .setLngLat(item.coordinates)
        .addTo(map);

      markersRef.current.push(markerInstance);
    });
  }, [markers, isStyleLoaded]);

  // Sincronizar Popup georreferenciado
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoaded) return;

    // Cerrar/limpiar popup anterior
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    if (popupRootRef.current) {
      popupRootRef.current.unmount();
      popupRootRef.current = null;
    }

    if (!selectedPlace) return;

    const container = document.createElement("div");

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "custom-place-popup",
      anchor: "bottom",
      offset: [0, -35]
    })
      .setLngLat(selectedPlace.coordinates)
      .setDOMContent(container)
      .addTo(map);

    popupRef.current = popup;

    const root = createRoot(container);
    popupRootRef.current = root;

    root.render(
      <PlaceDetailCard
        place={selectedPlace}
        onClose={() => {
          if (onClosePopup) onClosePopup();
        }}
        onZoom={() => {
          map.flyTo({
            center: selectedPlace.coordinates,
            zoom: 19.2,
            pitch: 70,
            bearing: map.getBearing() + 45,
            duration: 2000
          });
        }}
        onNext={() => {
          if (onNextPopup) onNextPopup(selectedPlace);
        }}
      />
    );

    popup.on("close", () => {
      popupRef.current = null;
      if (popupRootRef.current) {
        popupRootRef.current.unmount();
        popupRootRef.current = null;
      }
    });

  }, [selectedPlace, isStyleLoaded]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

// --- COMPONENTE INTERNO: TARJETA DE DETALLE DEL LUGAR ---
interface PlaceDetailCardProps {
  place: MarkerData;
  onClose: () => void;
  onZoom: () => void;
  onNext: () => void;
}

const PlaceDetailCard: React.FC<PlaceDetailCardProps> = ({
  place,
  onClose,
  onZoom,
  onNext,
}) => {
  return (
    <div
      style={{
        width: "330px",
        backgroundColor: "rgba(15, 23, 42, 0.94)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.5)",
        color: "#f8fafc",
        fontFamily: "Inter, sans-serif",
        position: "relative",
      }}
    >
      {/* Imagen de cabecera si existe */}
      {place.imageUrl && (
        <div
          style={{
            width: "100%",
            height: "130px",
            backgroundImage: `url(${place.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40px",
              background: "linear-gradient(transparent, rgba(15, 23, 42, 0.94))",
            }}
          />
        </div>
      )}

      {/* Botón Cerrar */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#94a3b8",
          fontSize: "14px",
          lineHeight: "26px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        ✕
      </button>

      {/* Contenido de la tarjeta */}
      <div style={{ padding: "16px" }}>
        {/* Badges */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
          {/* Badge 3D Live */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "20px",
              padding: "2px 8px",
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "#f87171",
              letterSpacing: "0.03em",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                backgroundColor: "#ef4444",
                borderRadius: "50%",
                display: "inline-block",
                animation: "pulseRed 1.5s infinite",
              }}
            />
            <style>{`
              @keyframes pulseRed {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.4); opacity: 0.5; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
            3D LIVE
          </div>

          {/* Tag Categoría */}
          {place.category && (
            <div
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "20px",
                padding: "2px 8px",
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "#60a5fa",
                letterSpacing: "0.03em",
              }}
            >
              {place.category}
            </div>
          )}
        </div>

        {/* Título y Descripción */}
        <h3 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>
          {place.title}
        </h3>
        <p style={{ margin: "0 0 12px 0", fontSize: "0.78rem", color: "#cbd5e1", lineHeight: "1.35" }}>
          {place.description}
        </p>

        {/* Estado */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.7rem", fontWeight: 600, color: "#10b981", marginBottom: "14px" }}>
          <span style={{ width: "5px", height: "5px", backgroundColor: "#10b981", borderRadius: "50%" }} />
          ABIERTO AHORA
        </div>

        {/* Botones de acción */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {place.websiteUrl && (
            <a
              href={place.websiteUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: "#3b82f6",
                border: "none",
                borderRadius: "10px",
                padding: "8px 12px",
                color: "#ffffff",
                fontSize: "0.8rem",
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(59, 130, 246, 0.25)",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
            >
              <span style={{ fontSize: "0.9rem" }}>✈</span> Ir al sitio
            </a>
          )}

          {/* Botón de Zoom */}
          <button
            onClick={onZoom}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)")}
            title="Acercar vista 3D"
          >
            🔎
          </button>

          {/* Botón Siguiente */}
          <button
            onClick={onNext}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)")}
            title="Siguiente lugar"
          >
            ➔
          </button>
        </div>
      </div>
    </div>
  );
};
