# Mapa 3D

Globo terráqueo 3D interactivo hecho con **React + TypeScript + Vite** y **MapLibre GL**.
Permite volar a lugares icónicos del mundo y explorarlos con relieve, edificios en 3D e imágenes satelitales.

## Funcionalidades

- 🌍 Proyección de globo con atmósfera y cielo (claro u oscuro según el estilo).
- ⛰️ Relieve 3D del terreno (tiles Terrarium de AWS) con exageración ×1.5.
- 🏙️ Edificios 3D extruidos con colores según su altura.
- 🛰️ Tres estilos: **Mapa**, **Satélite** (híbrido con calles y etiquetas) y **Oscuro**.
- ✈️ Vuelos animados a 11 destinos; al aterrizar se abre la tarjeta del lugar.
- 📍 Marcadores con tarjeta de detalle: acercar la vista 3D, ir al sitio web o pasar al siguiente lugar.
- ⌨️ Accesible con teclado (marcadores enfocables, <kbd>Esc</kbd> cierra la tarjeta) y adaptado a móvil.

## Uso

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # typecheck + build de producción en dist/
npm run lint     # oxlint
npm run preview  # sirve el build
```

## Estructura

```
src/
├── App.tsx / App.css              # Panel lateral, estilos de mapa y lógica de vuelos
├── data/destinations.ts           # Destinos y sus marcadores
└── components/mapa3d/
    ├── Map3D.tsx                  # Mapa: estilo, globo, terreno, satélite, edificios, marcadores y popup
    ├── PlaceDetailCard.tsx        # Tarjeta de detalle del lugar
    ├── ResetBearingControl.ts     # Brújula que restablece rumbo e inclinación
    ├── map3d.css                  # Marcadores, popup y tarjeta
    └── reset-bearing-control.css  # Controles del mapa
```

Para añadir un destino basta con agregar un objeto a `DESTINATIONS` en `src/data/destinations.ts`.

## Fuentes de datos

- Mapas vectoriales: [OpenFreeMap](https://openfreemap.org) (© OpenStreetMap contributors)
- Relieve: [Terrain Tiles de AWS Open Data](https://registry.opendata.aws/terrain-tiles/)
- Satélite: Esri World Imagery
