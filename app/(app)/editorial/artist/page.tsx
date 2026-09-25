"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import EmptyState from "@/components/app/EmptyState";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LoadingNotes from "@/components/app/LoadingNotes";
import Pager from "@/components/app/Pager";
import { ApiError, type Page } from "@/lib/api";
import {
  fetchArtistHeader,
  fetchSidemanAlbums,
  fetchArtistConnections,
  fetchSimilarArtists,
  type ArtistHeader,
  type SidemanAlbum,
  type ArtistConnections,
  type SimilarArtist,
} from "@/lib/artists";
import type { VocabularyTag } from "@/lib/albums";

function Cover({
  imageUrl,
  alt,
  className,
}: {
  imageUrl: string | null;
  alt: string;
  className: string;
}) {
  if (!imageUrl) return <ImagePlaceholder label="Artist photo" className={className} />;
  return (
    <div className={"relative overflow-hidden " + className}>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        unoptimized
        className="scale-[1.06] object-cover"
      />
    </div>
  );
}

// One labeled row of tag pills in the "Field notes" box below — renders
// nothing if this artist doesn't have any tags for that category.
function TagRow({ label, tags }: { label: string; tags: VocabularyTag[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex items-start gap-5 border-b border-[rgba(232,220,192,.18)] py-3.5 last:border-b-0">
      <span className="mt-1 w-[130px] flex-none font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(232,220,192,.55)]">
        {label}
      </span>
      <span className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag.code}
            className="rounded-full border-[1.5px] border-[#F6D013] px-2.5 py-1.5 text-[12px] font-semibold"
          >
            {tag.label}
          </span>
        ))}
      </span>
    </div>
  );
}

// One sideman-album card. artistName/artistId/totalTracks describe the
// ALBUM's leader, not necessarily the artist whose page this is. Not a
// Link — SidemanAlbum has no track id, and there's no album-level page to
// send it to anymore post track-only-pivot, so it's display-only.
function AlbumCard({ album }: { album: SidemanAlbum }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[rgba(232,220,192,.15)] bg-[rgba(232,220,192,.03)]">
      <div className="relative aspect-square w-full overflow-hidden bg-[#2A261C]">
        <Cover imageUrl={album.imageUrl} alt={album.name} className="h-full w-full" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="font-[family-name:var(--font-dm-sans)] text-[9.5px] font-medium uppercase tracking-[.12em] text-[rgba(232,220,192,.5)]">
          {album.artistName}
          {album.releaseYear ? ` · ${album.releaseYear}` : ""}
        </span>
        <div className="text-balance mt-2.5 font-[family-name:var(--font-fraunces)] text-[20px] leading-[1.15] font-extrabold tracking-[-.03em] text-[#E8DCC0]">
          {album.name}
        </div>
        <div className="mt-auto pt-4 font-[family-name:var(--font-dm-sans)] text-[9px] font-medium uppercase tracking-[.1em] text-[rgba(232,220,192,.45)]">
          {album.totalTracks ? `${album.totalTracks} tracks` : ""}
        </div>
      </div>
    </div>
  );
}

// One hand-curated similar-artist card — deliberately distinct from
// AlbumCard (circular photo, centered, no border/background box) since
// this is about the person, not a release.
function SimilarArtistCard({ artist }: { artist: SimilarArtist }) {
  return (
    <Link
      href={`/editorial/artist?id=${artist.id}`}
      className="flex flex-col items-center gap-3 text-center no-underline"
    >
      <Cover
        imageUrl={artist.imageUrl}
        alt={artist.name}
        className="aspect-square w-[190px] rounded-full"
      />
      <div className="font-[family-name:var(--font-fraunces)] text-[19px] font-extrabold tracking-[-.02em] text-[#E8DCC0]">
        {artist.name}
      </div>
      {artist.reason && (
        <p className="m-0 line-clamp-3 max-w-[220px] font-[family-name:var(--font-newsreader)] text-[13.5px] leading-[1.5] text-[rgba(232,220,192,.6)]">
          {artist.reason}
        </p>
      )}
    </Link>
  );
}

function ArtistEditorialContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [artist, setArtist] = useState<ArtistHeader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidemanAlbums, setSidemanAlbums] =
    useState<Page<SidemanAlbum> | null>(null);
  const [sidemanAlbumsPage, setSidemanAlbumsPage] = useState(0);
  const [similarArtists, setSimilarArtists] =
    useState<Page<SimilarArtist> | null>(null);
  const [similarArtistsPage, setSimilarArtistsPage] = useState(0);
  const [connections, setConnections] = useState<ArtistConnections | null>(
    null,
  );

  useEffect(() => {
    if (!id) return;
    fetchArtistHeader(id)
      .then(setArtist)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't load this editorial.",
        ),
      );
  }, [id]);

  // Independent of the header above — instruments/styles/contexts for the
  // "Field notes" box below the editorial.
  useEffect(() => {
    if (!id) return;
    fetchArtistConnections(id)
      .then(setConnections)
      .catch(() => {});
  }, [id]);

  // Albums where this artist shows up as a sideman rather than as the
  // leader. Comes back empty (not an error) rather than 404ing for an
  // artist with none.
  useEffect(() => {
    if (!id) return;
    fetchSidemanAlbums(id, sidemanAlbumsPage)
      .then(setSidemanAlbums)
      .catch(() => {});
  }, [id, sidemanAlbumsPage]);

  // Independent of everything above — hand-curated similar artists, for the
  // section at the very bottom of the page.
  useEffect(() => {
    if (!id) return;
    fetchSimilarArtists(id, similarArtistsPage)
      .then(setSimilarArtists)
      .catch(() => {});
  }, [id, similarArtistsPage]);

  if (!id) {
    return (
      <>
        <Navbar />
        <EmptyState
          title="No artist selected"
          subtitle="Open this page from an artist in the archive."
        />
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <EmptyState title="Couldn't load this" subtitle={error} />
        <Footer />
      </>
    );
  }

  if (!artist) {
    return (
      <>
        <Navbar />
        <LoadingNotes
          messages={[
            "Cueing the record…",
            "Pulling the sleeve notes…",
            "Checking the liner notes…",
          ]}
        />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="animate-[jazzlogs-fade-up_.6s_ease-out]">
      <div className="flex justify-between border-y border-[#F6D013] py-3 font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.16em]">
        <Link href="/archive" className="no-underline">
          ← Editorials
        </Link>
      </div>

      {/* Post track-only-pivot, an artist doesn't have its own editorial
          anymore (Track is the only object with one) — just enough here to
          orient (name, photo, Spotify link). */}
      <div className="grid grid-cols-1 items-center gap-9 pt-11 pb-6 md:grid-cols-[1fr_360px]">
        <div>
          <div className="font-[family-name:var(--font-fraunces)] text-[52px] leading-[.9] font-extrabold tracking-[-.05em] text-[#F6D013] sm:text-[72px]">
            {artist.name}
          </div>
        </div>
        <div>
          <Cover
            imageUrl={artist.imageUrl}
            alt={artist.name}
            className="aspect-square w-full rounded-[18px] md:w-[360px]"
          />
          {artist.spotifyUrl && (
            <a
              href={artist.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2.5 rounded-full bg-black px-6 py-[15px] text-[14px] font-bold text-[#E8DCC0] no-underline"
            >
              <svg width="17" height="17" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="12" fill="#1DB954" />
                <path
                  d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15 3.55-1.05 9.4-.85 13.1 1.35.45.25.6.85.35 1.3-.25.35-.85.5-1.3.25zm-.1 2.8c-.25.35-.7.5-1.05.25-2.7-1.65-6.8-2.15-9.95-1.15-.4.1-.85-.1-.95-.5-.1-.4.1-.85.5-.95 3.65-1.1 8.15-.55 11.25 1.35.3.15.45.65.2 1zm-1.2 2.75c-.2.3-.55.4-.85.2-2.35-1.45-5.3-1.75-8.8-.95-.35.1-.65-.15-.75-.45-.1-.35.15-.65.45-.75 3.8-.85 7.1-.5 9.7 1.1.35.15.4.55.25.85z"
                  fill="#000000"
                />
              </svg>
              Open in Spotify
            </a>
          )}
        </div>
      </div>

      {/* Field notes — instruments/styles/contexts from GET
          /artists/{id}/connections. similarArtists/albumAppearances/
          trackAppearances aren't here anymore; those get their own
          endpoint(s) later. */}
      {connections &&
        (connections.instruments.length > 0 ||
          connections.styles.length > 0 ||
          connections.contexts.length > 0) && (
          <div className="mx-auto mt-8 max-w-[680px] overflow-hidden rounded-2xl border-[1.5px] border-[#F6D013]">
            <div className="border-b-[1.5px] border-[#F6D013] px-6 py-4">
              <span className="font-[family-name:var(--font-fraunces)] text-[16px] font-extrabold tracking-[-.01em]">
                Field notes
              </span>
            </div>
            <div className="p-6">
              <TagRow label="Instruments" tags={connections.instruments} />
              <TagRow label="Styles" tags={connections.styles} />
              <TagRow label="Listen when" tags={connections.contexts} />
            </div>
          </div>
        )}

      <div className="mt-14 grid grid-cols-1 items-center gap-8 rounded-2xl bg-[#2A261C] p-9 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[#F6D013]">
            Go deeper
          </div>
          <div className="mt-3 font-[family-name:var(--font-fraunces)] text-[30px] font-extrabold leading-[1.05] tracking-[-.03em]">
            Ask the agent where to go next with {artist.name}.
          </div>
        </div>
        <Link
          href="/agent"
          className="rounded-full bg-[#F6D013] px-7 py-[17px] text-[15px] font-bold whitespace-nowrap text-[#1C1A14] no-underline"
        >
          Open the agent →
        </Link>
      </div>

      {/* Sideman albums — where this artist shows up as a sideman, not the
          leader. artistName/artistId/logNumber below describe the album's
          leader, not this page's artist. Same hide-if-empty rule. */}
      {sidemanAlbums && sidemanAlbums.content.length > 0 && (
        <>
          <div className="mt-16 mb-2 font-[family-name:var(--font-fraunces)] text-[46px] leading-[.9] font-extrabold tracking-[-.045em] text-[#F6D013] sm:text-[60px]">
            Sideman albums
          </div>
          <p className="max-w-[620px] font-[family-name:var(--font-newsreader)] text-[17px] leading-[1.6] text-[rgba(232,220,192,.75)]">
            Albums where {artist.name} shows up as a sideman, not the leader.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sidemanAlbums.content.map((r) => (
              <AlbumCard key={r.id} album={r} />
            ))}
          </div>
          <Pager
            page={sidemanAlbums.number}
            pageCount={sidemanAlbums.totalPages}
            onChange={setSidemanAlbumsPage}
          />
        </>
      )}

      {/* Similar artists — hand-curated, not algorithmic. Same hide-if-empty
          rule. */}
      {similarArtists && similarArtists.content.length > 0 && (
        <>
          <div className="mt-20 mb-2 font-[family-name:var(--font-fraunces)] text-[46px] leading-[.9] font-extrabold tracking-[-.045em] text-[#F6D013] sm:text-[60px]">
            Similar artists
          </div>
          <p className="max-w-[620px] font-[family-name:var(--font-newsreader)] text-[17px] leading-[1.6] text-[rgba(232,220,192,.75)]">
            Hand-picked, not algorithmic — where to go next from {artist.name}.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
            {similarArtists.content.map((a) => (
              <SimilarArtistCard key={a.id} artist={a} />
            ))}
          </div>
          <Pager
            page={similarArtists.number}
            pageCount={similarArtists.totalPages}
            onChange={setSimilarArtistsPage}
          />
        </>
      )}

      </div>

      <Footer />
    </>
  );
}

export default function ArtistEditorialPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <LoadingNotes />
        </>
      }
    >
      <ArtistEditorialContent />
    </Suspense>
  );
}
