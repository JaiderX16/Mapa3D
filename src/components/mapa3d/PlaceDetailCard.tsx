import type { MarkerData } from "./Map3D";

interface PlaceDetailCardProps {
  place: MarkerData;
  onClose: () => void;
  onZoom: () => void;
  onNext: () => void;
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const CloseIcon = () => (
  <svg width="14" height="14" {...iconProps}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="14" height="14" {...iconProps}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const ZoomIcon = () => (
  <svg width="16" height="16" {...iconProps}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" {...iconProps}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/** Tarjeta de detalle que se muestra dentro del popup del lugar seleccionado. */
export function PlaceDetailCard({ place, onClose, onZoom, onNext }: PlaceDetailCardProps) {
  const isOpen = place.isOpen ?? true;

  return (
    <div className="place-card">
      {/* Imagen de cabecera si existe */}
      {place.imageUrl && (
        <div
          className="place-card__image"
          style={{ backgroundImage: `url("${place.imageUrl}")` }}
        />
      )}

      {/* Botón Cerrar */}
      <button
        type="button"
        className="place-card__close"
        onClick={onClose}
        title="Cerrar"
        aria-label="Cerrar"
      >
        <CloseIcon />
      </button>

      {/* Contenido de la tarjeta */}
      <div className="place-card__body">
        {/* Badges */}
        <div className="place-card__badges">
          <span className="place-card__badge place-card__badge--live">
            <span className="place-card__live-dot" />
            3D LIVE
          </span>
          {place.category && (
            <span className="place-card__badge place-card__badge--category">
              {place.category}
            </span>
          )}
        </div>

        {/* Título y Descripción */}
        <h3 className="place-card__title">{place.title}</h3>
        <p className="place-card__description">{place.description}</p>

        {/* Estado */}
        <div className={`place-card__status${isOpen ? "" : " place-card__status--closed"}`}>
          <span className="place-card__status-dot" />
          {isOpen ? "ABIERTO AHORA" : "CERRADO"}
        </div>

        {/* Botones de acción */}
        <div className="place-card__actions">
          {place.websiteUrl && (
            <a
              className="place-card__link"
              href={place.websiteUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLinkIcon /> Ir al sitio
            </a>
          )}

          <button
            type="button"
            className="place-card__icon-btn"
            onClick={onZoom}
            title="Acercar vista 3D"
            aria-label="Acercar vista 3D"
          >
            <ZoomIcon />
          </button>

          <button
            type="button"
            className="place-card__icon-btn"
            onClick={onNext}
            title="Siguiente lugar"
            aria-label="Siguiente lugar"
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
