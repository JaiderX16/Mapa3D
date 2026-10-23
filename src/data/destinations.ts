import type { MarkerData } from "../components/mapa3d/Map3D";

/** Un destino icónico al que se puede volar desde el panel lateral */
export interface Destination {
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

export const DESTINATIONS: Destination[] = [
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
