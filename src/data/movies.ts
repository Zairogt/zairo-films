export interface Movie {
  id: string
  title: string
  sinopsis: string
  tagline: string
  year: number
  duration: string
  genre: string
  director: string
  poster_url: string
  backdrop: string
  trailer_url: string
  video_url: string
  precio_ver: number
  precio_descargar: number
  featured?: boolean
}

// Cinematic gradient posters using CSS (rendered as colored divs in demo)
export const MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Bajo el Sol de Septiembre',
    sinopsis: 'En medio del caos de las marchas de independencia en Quetzaltenango, un joven busca a su novia desaparecida sin saber que ella ha quedado atrapada en el extraño mundo de un director de cine obsesionado con convertirla en su nueva musa.',
    tagline: 'Mi mamá está bien, va vos, pero igual tomo.',
    year: 2024,
    duration: '1h 19min',
    genre: 'Drama',
    director: 'Rodolfo Espinoza Orantes',
    poster_url: 'https://vhx.imgix.net/rodolfoespinosa/assets/7c127620-2d27-4110-bfe8-a57722749097.jpg',
    backdrop: 'linear-gradient(135deg, #1a1208 0%, #2e1f08 40%, #5c3d0a 100%)',
    trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    precio_ver: 10,
    precio_descargar: 20,
    featured: true,
  },
  {
    id: '2',
    title: 'Aquí Me Quedo',
    sinopsis: 'Paco viaja a Quetzaltenango buscando escapar de sus problemas, pero un encuentro inesperado con Willy, un hombre al borde del colapso, lo arrastra a un día lleno de tensiones, confesiones y redescubrimientos en el corazón de Xela.',
    tagline: '¿Sabés cómo mataron a Tecún Umán?',
    year: 2024,
    duration: '1h 06min',
    genre: 'Drama',
    director: 'Rodolfo Espinoza Orantes',
    poster_url: 'https://vhx.imgix.net/rodolfoespinosa/assets/28b6e5b0-6965-4dc5-bc42-663505452f7c.jpg',
    backdrop: 'linear-gradient(135deg, #0e1a10 0%, #1a3020 40%, #2a4d32 100%)',
    trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    precio_ver: 10,
    precio_descargar: 20,
  },
  {
    id: '3',
    title: 'POL: Odisea en la USAC',
    sinopsis: 'Pol y su mejor amigo Flaco solo tenían que hacer un simple trámite, pero todo se complica cuando pierden unos documentos importantes y terminan perseguidos dentro del campus de la Universidad de San Carlos. Lo que parecía un día cualquiera se convierte en una aventura llena de enredos, amistad y descubrimientos.',
    tagline: 'Maldito subversivo.',
    year: 2023,
    duration: '1h 19min',
    genre: 'Comedia',
    director: 'Rodolfo Espinoza Orantes',
    poster_url: 'https://vhx.imgix.net/rodolfoespinosa/assets/dab0499c-9e8b-4f49-af47-299585ed0953.jpg',
    backdrop: 'linear-gradient(135deg, #0f1520 0%, #1a2540 40%, #253560 100%)',
    trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    precio_ver: 10,
    precio_descargar: 20,
  },
  {
    id: '4',
    title: 'Otros 4 Litros',
    sinopsis: 'Cuatro amigos de toda la vida se reencuentran para cumplir la última voluntad de su compañero fallecido: llevar sus cenizas hasta el lago de Atitlán y tomarse los últimos 4 litros de cerveza. Lo que empieza como un viaje de despedida se convierte en una travesía llena de humor, excesos y confesiones que pondrán a prueba la amistad, los recuerdos y la forma en que cada uno enfrenta la vida.',
    tagline: '¿Cómo sabés si sos pez o iguana?',
    year: 2023,
    duration: '1h 26min',
    genre: 'Comedia-Drama',
    director: 'Rodolfo Espinoza Orantes',
    poster_url: 'https://vhx.imgix.net/rodolfoespinosa/assets/8bc80bd6-276b-47ac-a10c-2fcb91d0280f.png',
    backdrop: 'linear-gradient(135deg, #0d1a20 0%, #102535 40%, #183a50 100%)',
    trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    precio_ver: 10,
    precio_descargar: 20,
  },
  {
    id: '5',
    title: 'Hostal Don Tulio',
    sinopsis: 'Durante la semana del fiambre familiar, Tulio enfrenta una situación inesperada: su hermano llega con su novia española, y él se ve atrapado por sentimientos que no debería tener. Entre secretos, tensiones familiares y decisiones complicadas, Tulio vivirá días que cambiarán su vida para siempre.',
    tagline: 'Él es el activo, yo soy el...',
    year: 2023,
    duration: '1h 35min',
    genre: 'Drama',
    director: 'Rodolfo Espinoza Orantes',
    poster_url: 'https://vhx.imgix.net/rodolfoespinosa/assets/e5fb0b90-521b-48e5-acc6-0c150d287125.jpg',
    backdrop: 'linear-gradient(135deg, #1a150a 0%, #2e2510 40%, #4a3c18 100%)',
    trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    precio_ver: 10,
    precio_descargar: 20,
  },
  {
    id: '6',
    title: 'CARGAM: Gestores Culturales',
    sinopsis: 'Eva trabaja en Cargam, una pequeña agencia de gestión cultural en Xela, que compite ferozmente con la asociación de gestores culturales de Guatemala, robándose artistas y proyectos entre ambos. Esta historia, contada como un experimento en redes sociales, muestra las intrigas, rivalidades y estrategias detrás del mundo cultural en Guatemala.',
    tagline: '¿Puta, esa es una esvástica?',
    year: 2023,
    duration: '1h 16min',
    genre: 'Drama',
    director: 'Rodolfo Espinoza Orantes',
    poster_url: 'https://vhx.imgix.net/rodolfoespinosa/assets/45aa6bf6-84a7-4d50-9e8e-1baf8f44cc35.png',
    backdrop: 'linear-gradient(135deg, #150a1a 0%, #241030 40%, #3d1a50 100%)',
    trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    precio_ver: 10,
    precio_descargar: 20,
  },
  {
    id: '7',
    title: 'Making Of: Un Detrás de Cámaras',
    sinopsis: 'Making Of es un falso documental que sigue a un grupo de cineastas mientras graban un cortometraje, mostrando con humor y sátira los enredos, conflictos y dinámicas absurdas que surgen detrás de cámaras. Una mirada única al proceso creativo y a las relaciones personales en el mundo del cine guatemalteco.',
    tagline: 'Y culpo a la SAT por no hacerme huevos.',
    year: 2023,
    duration: '1h 10min',
    genre: 'Mockumentary',
    director: 'Rodolfo Espinoza Orantes',
    poster_url: 'https://vhx.imgix.net/rodolfoespinosa/assets/23a6fd1d-ce93-4261-9536-178256ca29ef.jpg',
    backdrop: 'linear-gradient(135deg, #0a0f1a 0%, #101820 40%, #182535 100%)',
    trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    precio_ver: 10,
    precio_descargar: 20,
  },
]

export const FEATURED_MOVIE = MOVIES[0]
