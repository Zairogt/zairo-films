-- ============================================================
--  ZAIRO FILMS — Schema inicial
--  Ejecutar completo en: Supabase → SQL Editor → Run
--  IMPORTANTE: todas las tablas se crean primero,
--  luego se activa RLS, luego se crean todas las políticas.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- PASO 1: CREAR TODAS LAS TABLAS
-- ────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id         uuid        references auth.users(id) on delete cascade primary key,
  name       text        not null,
  email      text        not null,
  is_admin   boolean     not null default false,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.movies (
  id               uuid          default gen_random_uuid() primary key,
  title            text          not null,
  sinopsis         text,
  tagline          text,
  year             integer,
  duration         text,
  genre            text,
  director         text,
  poster_url       text,
  backdrop         text,
  trailer_url      text,
  precio_ver       numeric(10,2) not null default 10,
  precio_descargar numeric(10,2) not null default 20,
  featured         boolean       not null default false,
  sort_order       integer       not null default 0,
  created_at       timestamptz   not null default now()
);

create table if not exists public.movie_secure (
  movie_id  uuid references public.movies(id) on delete cascade primary key,
  video_url text not null
);

create table if not exists public.purchases (
  id                uuid          default gen_random_uuid() primary key,
  user_id           uuid          not null references public.profiles(id) on delete cascade,
  movie_id          uuid          not null references public.movies(id)   on delete cascade,
  tier              text          not null check (tier in ('watch', 'download')),
  amount            numeric(10,2) not null,
  stripe_payment_id text,
  created_at        timestamptz   not null default now(),
  unique(user_id, movie_id)
);


-- ────────────────────────────────────────────────────────────
-- PASO 2: ACTIVAR RLS EN TODAS LAS TABLAS
-- ────────────────────────────────────────────────────────────

alter table public.profiles     enable row level security;
alter table public.movies       enable row level security;
alter table public.movie_secure enable row level security;
alter table public.purchases    enable row level security;


-- ────────────────────────────────────────────────────────────
-- PASO 3: POLÍTICAS DE profiles
-- ────────────────────────────────────────────────────────────

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Función security definer para verificar admin sin causar recursión en RLS
create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_current_user_admin());

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);


-- ────────────────────────────────────────────────────────────
-- PASO 4: POLÍTICAS DE movies
-- ────────────────────────────────────────────────────────────

create policy "movies_select_public"
  on public.movies for select
  using (true);

create policy "movies_admin_write"
  on public.movies for all
  using (public.is_current_user_admin());


-- ────────────────────────────────────────────────────────────
-- PASO 5: POLÍTICAS DE movie_secure
--   (purchases ya existe aquí — sin error de referencia)
-- ────────────────────────────────────────────────────────────

-- Cualquier usuario autenticado puede leer el video_url
-- (free = con anuncios overlay, watch/download = sin anuncios — misma URL, distinta UX)
create policy "movie_secure_select_authenticated"
  on public.movie_secure for select
  using (auth.uid() is not null);

create policy "movie_secure_admin_write"
  on public.movie_secure for all
  using (public.is_current_user_admin());


-- ────────────────────────────────────────────────────────────
-- PASO 6: POLÍTICAS DE purchases
-- ────────────────────────────────────────────────────────────

create policy "purchases_select_own"
  on public.purchases for select
  using (auth.uid() = user_id);

create policy "purchases_insert_own"
  on public.purchases for insert
  with check (auth.uid() = user_id);

create policy "purchases_update_own"
  on public.purchases for update
  using (auth.uid() = user_id);

create policy "purchases_select_admin"
  on public.purchases for select
  using (public.is_current_user_admin());


-- ────────────────────────────────────────────────────────────
-- PASO 7: TRIGGER — auto-crear perfil al registrarse
-- ────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ────────────────────────────────────────────────────────────
-- PASO 8: SEED — películas de Zairo Films
-- ────────────────────────────────────────────────────────────

insert into public.movies
  (id, title, sinopsis, tagline, year, duration, genre, director,
   poster_url, backdrop, trailer_url, precio_ver, precio_descargar, featured, sort_order)
values
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001',
    'Bajo el Sol de Septiembre',
    'En medio del caos de las marchas de independencia en Quetzaltenango, un joven busca a su novia desaparecida sin saber que ella ha quedado atrapada en el extraño mundo de un director de cine obsesionado con convertirla en su nueva musa.',
    '¿Ustedes saben cómo es un exorcismo al revés?',
    2025, '1h 19min', 'Drama', 'Rodolfo Espinosa Orantes',
    'https://vhx.imgix.net/rodolfoespinosa/assets/7c127620-2d27-4110-bfe8-a57722749097.jpg',
    'linear-gradient(135deg, #1a1208 0%, #2e1f08 40%, #5c3d0a 100%)',
    'https://www.youtube.com/embed/TRAILER_1',
    10, 20, true, 1
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380002',
    'Aquí Me Quedo',
    'Paco viaja a Quetzaltenango buscando escapar de sus problemas, pero un encuentro inesperado con Willy, un hombre al borde del colapso, lo arrastra a un día lleno de tensiones, confesiones y redescubrimientos en el corazón de Xela.',
    '¿Sabés cómo mataron a Tecún Umán?',
    2010, '1h 06min', 'Drama', 'Rodolfo Espinosa Orantes',
    'https://vhx.imgix.net/rodolfoespinosa/assets/28b6e5b0-6965-4dc5-bc42-663505452f7c.jpg',
    'linear-gradient(135deg, #0e1a10 0%, #1a3020 40%, #2a4d32 100%)',
    'https://www.youtube.com/embed/TRAILER_2',
    10, 20, false, 2
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003',
    'POL: Odisea en la USAC',
    'Pol y su mejor amigo Flaco solo tenían que hacer un simple trámite, pero todo se complica cuando pierden unos documentos importantes y terminan perseguidos dentro del campus de la Universidad de San Carlos.',
    'Maldito subversivo.',
    2014, '1h 19min', 'Comedia', 'Rodolfo Espinosa Orantes',
    'https://vhx.imgix.net/rodolfoespinosa/assets/dab0499c-9e8b-4f49-af47-299585ed0953.jpg',
    'linear-gradient(135deg, #0f1520 0%, #1a2540 40%, #253560 100%)',
    'https://www.youtube.com/embed/TRAILER_3',
    10, 20, false, 3
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004',
    'Otros 4 Litros',
    'Cuatro amigos de toda la vida se reencuentran para cumplir la última voluntad de su compañero fallecido: llevar sus cenizas hasta el lago de Atitlán y tomarse los últimos 4 litros de cerveza.',
    '¿Eso que salió volando era un policía?',
    2016, '1h 26min', 'Comedia-Drama', 'Rodolfo Espinosa Orantes',
    'https://vhx.imgix.net/rodolfoespinosa/assets/8bc80bd6-276b-47ac-a10c-2fcb91d0280f.png',
    'linear-gradient(135deg, #0d1a20 0%, #102535 40%, #183a50 100%)',
    'https://www.youtube.com/embed/TRAILER_4',
    10, 20, false, 4
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380005',
    'Hostal Don Tulio',
    'Durante la semana del fiambre familiar, Tulio enfrenta una situación inesperada: su hermano llega con su novia española, y él se ve atrapado por sentimientos que no debería tener.',
    'Él es el pasivo, yo soy el agresivo.',
    2018, '1h 35min', 'Drama', 'Rodolfo Espinosa Orantes',
    'https://vhx.imgix.net/rodolfoespinosa/assets/e5fb0b90-521b-48e5-acc6-0c150d287125.jpg',
    'linear-gradient(135deg, #1a150a 0%, #2e2510 40%, #4a3c18 100%)',
    'https://www.youtube.com/embed/TRAILER_5',
    10, 20, false, 5
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006',
    'CARGAM: Gestores Culturales',
    'Eva trabaja en Cargam, una pequeña agencia de gestión cultural en Xela, que compite ferozmente con la asociación de gestores culturales de Guatemala.',
    '¿Puta, esa es una esvástica?',
    2022, '1h 16min', 'Drama', 'Rodolfo Espinosa Orantes',
    'https://vhx.imgix.net/rodolfoespinosa/assets/45aa6bf6-84a7-4d50-9e8e-1baf8f44cc35.png',
    'linear-gradient(135deg, #150a1a 0%, #241030 40%, #3d1a50 100%)',
    'https://www.youtube.com/embed/TRAILER_6',
    10, 20, false, 6
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380007',
    'Making Of: Un Detrás de Cámaras',
    'Making Of es un falso documental que sigue a un grupo de cineastas mientras graban un cortometraje, mostrando con humor y sátira los enredos, conflictos y dinámicas absurdas que surgen detrás de cámaras.',
    'Y culpo a la SAT por no hacerme huevos.',
    2022, '1h 10min', 'Mockumentary', 'Rodolfo Espinosa Orantes',
    'https://vhx.imgix.net/rodolfoespinosa/assets/23a6fd1d-ce93-4261-9536-178256ca29ef.jpg',
    'linear-gradient(135deg, #0a0f1a 0%, #101820 40%, #182535 100%)',
    'https://www.youtube.com/embed/TRAILER_7',
    10, 20, false, 7
  )
on conflict (id) do nothing;


-- ────────────────────────────────────────────────────────────
-- PASO 9: SEED — video_url de Vimeo OTT
--   Reemplazar REEMPLAZAR_X con los links reales de Vimeo
-- ────────────────────────────────────────────────────────────

insert into public.movie_secure (movie_id, video_url)
values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'https://player.vimeo.com/video/REEMPLAZAR_1'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'https://player.vimeo.com/video/REEMPLAZAR_2'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'https://player.vimeo.com/video/REEMPLAZAR_3'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'https://player.vimeo.com/video/REEMPLAZAR_4'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'https://player.vimeo.com/video/REEMPLAZAR_5'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'https://player.vimeo.com/video/REEMPLAZAR_6'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380007', 'https://player.vimeo.com/video/REEMPLAZAR_7')
on conflict (movie_id) do nothing;


-- ────────────────────────────────────────────────────────────
-- PASO 10: PRIMER ADMIN
--   Después de registrarte en la app con admin@zairofilms.com,
--   ejecuta esto en SQL Editor para dar rol de admin:
--
--   update public.profiles
--     set is_admin = true
--   where email = 'admin@zairofilms.com';
-- ────────────────────────────────────────────────────────────
