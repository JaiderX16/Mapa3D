import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import maplibregl from "maplibre-gl";
import { ResetBearingControl } from "./ResetBearingControl";
import { PlaceDetailCard } from "./PlaceDetailCard";

// Estilos necesarios de MapLibre, de nuestro control de brújula y de marcadores/popup
import "maplibre-gl/dist/maplibre-gl.css";
import "./reset-bearing-control.css";
import "./map3d.css";

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
const TERRAIN_EXAGGERATION = 1.5;
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

const BUILDINGS_LAYER_ID = "3d-buildings-extrusion";

// Zoom máximo normal y en satélite (limitado para evitar el error "Map data not yet available" de Esri en Huancayo)
const MAX_ZOOM = 20;
const SATELLITE_MAX_ZOOM = 17;

// Cielo del globo. El halo de la atmósfera se ve al alejarse y se desvanece al acercarse a la ciudad.
// "fog-ground-blend": 1 desactiva la niebla sobre el terreno, que MapLibre no soporta en el globo.
const ATMOSPHERE_BLEND: maplibregl.SkySpecification["atmosphere-blend"] = [
  "interpolate", ["linear"], ["zoom"],
  0, 1,
  10, 1,
  12, 0,
];
const LIGHT_SKY: maplibregl.SkySpecification = {
  "sky-color": "#88c6fc",
  "horizon-color": "#e0f2fe",
  "sky-horizon-blend": 0.7,
  "fog-ground-blend": 1,
  "atmosphere-blend": ATMOSPHERE_BLEND,
};
const DARK_SKY: maplibregl.SkySpecification = {
  "sky-color": "#0b1120",
  "horizon-color": "#1e293b",
  "sky-horizon-blend": 0.7,
  "fog-ground-blend": 1,
  "atmosphere-blend": ATMOSPHERE_BLEND,
};

// Textos de los controles de MapLibre en español
const MAP_LOCALE: Record<string, string> = {
  "AttributionControl.ToggleAttribution": "Mostrar u ocultar atribución",
  "AttributionControl.MapFeedback": "Comentarios sobre el mapa",
  "Map.Title": "Mapa",
  "Marker.Title": "Marcador del mapa",
  "NavigationControl.ZoomIn": "Acercar",
  "NavigationControl.ZoomOut": "Alejar",
  "Popup.Close": "Cerrar",
};

// Separación entre el popup y la parte superior de cada tipo de marcador (ver map3d.css)
const POPUP_OFFSET_AVATAR = -68;
const POPUP_OFFSET_DOT = -22;

const isDarkStyle = (styleUrl: string) => styleUrl.toLowerCase().includes("dark");

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
  // La vista inicial solo se lee al crear el mapa
  const initialViewRef = useRef({
    center: initialCenter,
    zoom: initialZoom,
    pitch: initialPitch,
    bearing: initialBearing,
  });
  // Callbacks más recientes, para que los listeners del mapa nunca usen versiones obsoletas
  const onMapLoadRef = useRef(onMapLoad);
  const onMarkerClickRef = useRef(onMarkerClick);
  useEffect(() => {
    onMapLoadRef.current = onMapLoad;
    onMarkerClickRef.current = onMarkerClick;
  });

  // URL del estilo que MapLibre está terminando de procesar (se fija en transformStyle,
  // justo antes de que se dispare "style.load") y URL del último estilo cargado por completo.
  const parsingStyleUrlRef = useRef<string | null>(null);
  const [loadedStyleUrl, setLoadedStyleUrl] = useState<string | null>(null);
  // Comparar con la URL pedida evita tocar capas de un estilo que todavía se está cargando
  const isStyleLoaded = loadedStyleUrl === styleUrl;

  // Nodo donde React pinta la tarjeta del popup (mediante un portal)
  const [popupContainer] = useState(() => document.createElement("div"));

  // Inicializar mapa (una sola vez)
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const map = new maplibregl.Map({
      container,
      ...initialViewRef.current,
      maxPitch: 85,
      maxZoom: MAX_ZOOM,
      locale: MAP_LOCALE,
    });

    mapRef.current = map;
    if (import.meta.env.DEV) {
      // Acceso rápido desde la consola del navegador durante el desarrollo
      (window as unknown as { map?: maplibregl.Map }).map = map;
    }

    // Manejar carga inicial y re-cargas de estilo
    map.on("style.load", () => {
      setLoadedStyleUrl(parsingStyleUrlRef.current);
      onMapLoadRef.current?.(map);
    });

    // Con relieve activo, MapLibre congela la elevación de la cámara durante flyTo/easeTo y no la
    // vuelve a descongelar: si el relieve del destino aún no había cargado, la cámara se queda a la
    // altura del lugar anterior (flotando, o bajo las montañas con el mapa en blanco). Al terminar
    // cada movimiento la descongelamos para que se recalcule con el terreno real.
    map.on("moveend", () => {
      const internal = map as unknown as { _elevationFreeze?: boolean };
      if (map.getTerrain() && internal._elevationFreeze) {
        internal._elevationFreeze = false;
        map.triggerRepaint();
      }
    });

    // Agregar zoom y brújula
    map.addControl(new maplibregl.NavigationControl({
      showZoom: true,
      showCompass: false
    }), "bottom-right");

    map.addControl(new ResetBearingControl({ label: "Restablecer orientación" }), "bottom-right");

    return () => {
      map.remove();
      mapRef.current = null;
      setLoadedStyleUrl(null);
    };
  }, []);

  // Cargar el estilo (y cambiarlo dinámicamente si cambia styleUrl)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sky = isDarkStyle(styleUrl) ? DARK_SKY : LIGHT_SKY;
    map.setStyle(styleUrl, {
      // Recarga completa: el diff de estilos de MapLibre falla cuando el terreno está activo
      diff: false,
      // Inyectar el globo y el cielo en el propio estilo, así se ven desde el primer fotograma
      transformStyle: (_previous, next) => {
        parsingStyleUrlRef.current = styleUrl;
        return { ...next, projection: { type: "globe" }, sky };
      },
    });
  }, [styleUrl]);

  // Sincronizar fuentes y capas que dependen del estado del estilo actual
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoaded) return;

    syncSatellite(map, showSatellite);
    syncTerrain(map, enableTerrain);
    syncBuildings(map, enable3DBuildings && !showSatellite, isDarkStyle(styleUrl));
  }, [isStyleLoaded, showSatellite, enableTerrain, enable3DBuildings, styleUrl]);

  // Sincronizar Marcadores (son elementos DOM: sobreviven a los cambios de estilo)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const instances = markers.map((item) =>
      new maplibregl.Marker({
        element: createMarkerElement(item, () => onMarkerClickRef.current?.(item)),
        // El avatar es un pin: su punta (abajo) señala el lugar exacto
        anchor: item.imageUrl ? "bottom" : "center",
      })
        .setLngLat(item.coordinates)
        .addTo(map)
    );

    return () => instances.forEach((marker) => marker.remove());
  }, [markers]);

  // Sincronizar Popup georreferenciado
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlace) return;

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "custom-place-popup",
      anchor: "bottom",
      offset: [0, selectedPlace.imageUrl ? POPUP_OFFSET_AVATAR : POPUP_OFFSET_DOT],
      maxWidth: "none",
    })
      .setLngLat(selectedPlace.coordinates)
      .setDOMContent(popupContainer)
      .addTo(map);

    return () => {
      popup.remove();
    };
  }, [selectedPlace, popupContainer]);

  const handleZoom = (place: MarkerData) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: place.coordinates,
      zoom: 19.2,
      pitch: 70,
      bearing: map.getBearing() + 45,
      duration: 2000
    });
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      {selectedPlace &&
        createPortal(
          <PlaceDetailCard
            place={selectedPlace}
            onClose={() => onClosePopup?.()}
            onZoom={() => handleZoom(selectedPlace)}
            onNext={() => onNextPopup?.(selectedPlace)}
          />,
          popupContainer
        )}
    </div>
  );
};

/** Crea el elemento DOM de un marcador: avatar circular si tiene imagen, o punto rojo pulsante. */
function createMarkerElement(item: MarkerData, onSelect: () => void): HTMLElement {
  // MapLibre posiciona este contenedor con `transform`; los efectos visuales van en el hijo
  // para que una transición CSS no haga que el marcador "flote" detrás del mapa al moverlo.
  const el = document.createElement("div");
  el.className = "map-marker";
  el.tabIndex = 0;
  el.title = item.title;
  el.setAttribute("aria-label", item.title);

  const visual = document.createElement("div");
  if (item.imageUrl) {
    visual.className = "custom-marker-avatar";
    visual.style.backgroundImage = `url("${item.imageUrl}")`;
  } else {
    visual.className = "custom-marker-red-dot";
  }
  el.appendChild(visual);

  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onSelect();
  });
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  });

  return el;
}

/** Satélite (híbrido): imágenes de Esri de fondo, con calles y etiquetas vectoriales encima. */
function syncSatellite(map: maplibregl.Map, visible: boolean) {
  if (visible) {
    if (!map.getSource(SATELLITE_SOURCE_ID)) {
      map.addSource(SATELLITE_SOURCE_ID, SATELLITE_SOURCE);
    }
    if (!map.getLayer(SATELLITE_LAYER_ID)) {
      // Buscamos la primera capa que sea una calle (line) o texto (symbol) para meter el satélite justo antes
      const firstOverlayId = map
        .getStyle()
        .layers.find((layer) => layer.type === "line" || layer.type === "symbol")?.id;
      map.addLayer({
        id: SATELLITE_LAYER_ID,
        type: "raster",
        source: SATELLITE_SOURCE_ID,
      }, firstOverlayId);
    } else {
      map.setLayoutProperty(SATELLITE_LAYER_ID, "visibility", "visible");
    }
  } else if (map.getLayer(SATELLITE_LAYER_ID)) {
    map.setLayoutProperty(SATELLITE_LAYER_ID, "visibility", "none");
  }

  // setMaxZoom también reduce el zoom actual si supera el nuevo límite
  map.setMaxZoom(visible ? SATELLITE_MAX_ZOOM : MAX_ZOOM);
}

/** Terreno 3D (relieve). */
function syncTerrain(map: maplibregl.Map, enabled: boolean) {
  if (enabled) {
    if (!map.getSource(TERRAIN_SOURCE_ID)) {
      map.addSource(TERRAIN_SOURCE_ID, TERRAIN_SOURCE);
    }
    if (!map.getTerrain()) {
      map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: TERRAIN_EXAGGERATION });
    }
  } else if (map.getTerrain()) {
    map.setTerrain(null);
  }
}

/** Edificios 3D (fill-extrusion), con colores según el tema claro u oscuro. */
function syncBuildings(map: maplibregl.Map, visible: boolean, isDark: boolean) {
  const { layers, sources } = map.getStyle();

  // Ocultar los edificios 3D que ya trae el estilo base: los nuestros los reemplazan,
  // así no se dibujan dos veces y el interruptor "Edificios 3D" los controla todos.
  for (const layer of layers) {
    if (layer.type === "fill-extrusion" && layer.id !== BUILDINGS_LAYER_ID && layer.layout?.visibility !== "none") {
      map.setLayoutProperty(layer.id, "visibility", "none");
    }
  }

  if (map.getLayer(BUILDINGS_LAYER_ID)) {
    map.setLayoutProperty(BUILDINGS_LAYER_ID, "visibility", visible ? "visible" : "none");
    return;
  }
  if (!visible) return;

  // Buscar la fuente vectorial del estilo actual
  // (OpenFreeMap usa 'openmaptiles', otros proveedores 'osm' o 'cartodb')
  const isVector = (id: string) => sources[id]?.type === "vector";
  const sourceId = ["openmaptiles", "osm", "cartodb"].find(isVector) ?? Object.keys(sources).find(isVector);
  if (!sourceId) return;

  const colors = isDark
    ? {
        low: "#1e293b",       // Edificios muy bajos (slate oscuro)
        standard: "#334155",  // Estándar (slate medio)
        medium: "#475569",    // Medianos
        tall: "#64748b",      // Rascacielos altos
      }
    : {
        low: "#f3f4f6",       // Edificios muy bajos (gris off-white)
        standard: "#e5e7eb",  // Estándar (gris claro)
        medium: "#d1d5db",    // Medianos
        tall: "#9ca3af",      // Rascacielos altos
      };

  // Insertar debajo de la primera capa de texto para que las etiquetas queden por encima
  const firstSymbolId = layers.find((layer) => layer.type === "symbol")?.id;

  map.addLayer({
    id: BUILDINGS_LAYER_ID,
    source: sourceId,
    "source-layer": "building",
    type: "fill-extrusion",
    minzoom: 13,
    paint: {
      "fill-extrusion-color": [
        "interpolate",
        ["linear"],
        ["coalesce", ["get", "render_height"], ["get", "height"], 15],
        0, colors.low,
        20, colors.standard,
        50, colors.medium,
        150, colors.tall
      ],
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
  }, firstSymbolId);
}
