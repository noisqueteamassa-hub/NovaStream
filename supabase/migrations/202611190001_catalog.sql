create extension if not exists pgcrypto;

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null default 'Artista desconhecido',
  album text,
  artwork_url text,
  stream_url text not null,
  download_url text,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  source text not null default 'NovaStream',
  downloadable boolean not null default false,
  license_label text,
  rights_status text not null default 'pending'
    check (rights_status in ('pending', 'authorized', 'rejected')),
  is_published boolean not null default false,
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' ||
      coalesce(artist, '') || ' ' || coalesce(album, ''))
  ) stored,
  created_at timestamptz not null default now()
);

create index if not exists tracks_search_vector_idx
  on public.tracks using gin (search_vector);

alter table public.tracks enable row level security;

drop policy if exists "Public can read authorized published tracks" on public.tracks;
create policy "Public can read authorized published tracks"
  on public.tracks for select to anon, authenticated
  using (
    is_published = true
    and rights_status = 'authorized'
    and stream_url like 'https://%'
  );

create or replace function public.search_catalog(
  search_query text,
  result_limit integer default 30
)
returns table (
  id uuid,
  title text,
  artist text,
  album text,
  artwork_url text,
  stream_url text,
  download_url text,
  duration_seconds integer,
  source text,
  downloadable boolean,
  license_label text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    t.id, t.title, t.artist, t.album, t.artwork_url, t.stream_url,
    case when t.downloadable then t.download_url else null end,
    t.duration_seconds, t.source,
    (t.downloadable and t.download_url is not null),
    t.license_label
  from public.tracks t
  where
    nullif(trim(search_query), '') is not null
    and t.is_published = true
    and t.rights_status = 'authorized'
    and t.stream_url like 'https://%'
    and t.search_vector @@ websearch_to_tsquery('simple', search_query)
  order by ts_rank(t.search_vector, websearch_to_tsquery('simple', search_query)) desc,
    t.title asc
  limit greatest(1, least(coalesce(result_limit, 30), 30));
$$;

grant execute on function public.search_catalog(text, integer) to anon, authenticated;
