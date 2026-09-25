import Link from "next/link";
import AdminGate from "@/components/admin/AdminGate";

const TOOLS = [
  {
    href: "/admin/playlists/new",
    title: "Nueva playlist",
    description:
      "Crear la ficha de una playlist (metadata) — nace en borrador; el tracklist se carga después, track por track.",
  },
  {
    href: "/admin/playlists/tracks",
    title: "Agregar track a playlist",
    description:
      "Agregar un track existente del catálogo al final de una playlist, a partir de su Playlist ID y Track ID.",
  },
  {
    href: "/admin/playlists/cover",
    title: "Cover de playlist",
    description:
      "Subir la imagen de portada real de una playlist, a partir de su Playlist ID.",
  },
  {
    href: "/admin/playlists/detail-images",
    title: "Imágenes de detalle de playlist",
    description:
      "Subir la imagen principal, banner y/o footer del detalle de una playlist, a partir de su Playlist ID.",
  },
  {
    href: "/admin/playlists/publish",
    title: "Publicar playlist",
    description:
      "Publicar una playlist (o volverla a borrador) a partir de su Playlist ID.",
  },
  {
    href: "/admin/playlists/featured",
    title: "Playlist featured",
    description:
      "Marcar o sacar la playlist destacada del archive, a partir de su Playlist ID.",
  },
  {
    href: "/admin/playlists/delete",
    title: "Borrar playlist",
    description:
      "Hard delete de una playlist completa (metadata, tracks, likes, listens) a partir de su Playlist ID. No hay vuelta atrás.",
  },
  {
    href: "/admin/tracks/new",
    title: "Nuevo track",
    description:
      "Cargar tracks a partir de su Spotify Track ID — el álbum y el artista se resuelven o se crean solos.",
  },
  {
    href: "/admin/artists/new",
    title: "Nuevo artista",
    description: "Crear un artista a partir de su Spotify Artist ID.",
  },
  {
    href: "/admin/tracks/editorial",
    title: "Editorial de track",
    description:
      "Cargar la editorial de un track existente a partir de su Track ID.",
  },
  {
    href: "/admin/tracks/editorial-image",
    title: "Imágenes de editorial de track",
    description:
      "Subir las 5 imágenes de la editorial de un track (cover, principal, secundaria, banner, footer), a partir de su Track ID.",
  },
  {
    href: "/admin/tracks/tags",
    title: "Tags de track",
    description:
      "Cargar moods, contexts, rhythms e instrumentos de un track existente a partir de su Track ID.",
  },
  {
    href: "/admin/tracks/featured",
    title: "Featured tracks",
    description:
      "Agregar o sacar un track de Featured Tracks (máximo 6) a partir de su Track ID.",
  },
  {
    href: "/admin/artists/tags",
    title: "Tags de artista",
    description:
      "Cargar instrumento principal, styles y contexts de un artista existente a partir de su Artist ID.",
  },
  {
    href: "/admin/artists/similar",
    title: "Similar artists",
    description:
      "Agregar o sacar un artista de la lista de similares curada a mano de otro.",
  },
  {
    href: "/admin/series/new",
    title: "Nueva serie",
    description:
      "Crear la ficha de una serie (metadata) — nace en borrador; los capítulos se cargan después.",
  },
  {
    href: "/admin/series/edit",
    title: "Editar serie",
    description:
      "Reemplazar título, dek y description de una serie existente a partir de su Series ID.",
  },
  {
    href: "/admin/series/cover",
    title: "Cover de serie",
    description:
      "Subir la imagen de portada real de una serie, a partir de su Series ID.",
  },
  {
    href: "/admin/series/detail-images",
    title: "Imágenes de detalle de serie",
    description:
      "Subir la imagen principal, banner y/o footer del detalle de una serie, a partir de su Series ID.",
  },
  {
    href: "/admin/series/publish",
    title: "Publicar serie",
    description:
      "Publicar una serie (o volverla a borrador) a partir de su Series ID.",
  },
  {
    href: "/admin/series/featured",
    title: "Serie featured",
    description:
      "Marcar o sacar la serie destacada del archive, a partir de su Series ID.",
  },
  {
    href: "/admin/series/chapters/new",
    title: "Nuevo capítulo",
    description:
      "Agregar un capítulo al final de una serie, a partir de su Series ID.",
  },
  {
    href: "/admin/series/chapters/edit",
    title: "Editar capítulo",
    description:
      "Reemplazar type, trackId, título, note y audioDurationMs de un capítulo, a partir de su Series ID y Chapter ID.",
  },
  {
    href: "/admin/series/chapters/audio",
    title: "Audio de capítulo",
    description:
      "Subir el audio real de un capítulo, a partir de su Series ID y Chapter ID.",
  },
  {
    href: "/admin/series/chapters/cover",
    title: "Imágenes de capítulo",
    description:
      "Subir la imagen del capítulo y/o la imagen landscape/hero de un capítulo, a partir de su Series ID y Chapter ID.",
  },
];

export default function AdminHomePage() {
  return (
    <AdminGate showBackLink={false}>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.02em]">
          Panel de admin
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(232,220,192,.6)]">
          Herramientas internas de carga de contenido.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-xl border border-[rgba(232,220,192,.15)] bg-[rgba(232,220,192,.02)] p-5 transition-colors hover:border-[#F6D013] hover:bg-[rgba(232,220,192,.04)]"
            >
              <div className="font-bold text-[#E8DCC0]">{tool.title}</div>
              <p className="mt-1.5 text-sm text-[rgba(232,220,192,.6)]">
                {tool.description}
              </p>
              <span className="mt-3 inline-block text-sm font-bold text-[#F6D013]">
                Abrir →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AdminGate>
  );
}
