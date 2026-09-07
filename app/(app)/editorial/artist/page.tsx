"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import EmptyState from "@/components/app/EmptyState";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LikeButton from "@/components/app/LikeButton";
import LoadingNotes from "@/components/app/LoadingNotes";
import Pager from "@/components/app/Pager";
import { AverageStars } from "@/components/app/StarRating";
import { ApiError, type Page } from "@/lib/api";
import {
  fetchArtistHeader,
  fetchEssentialListening,
  fetchSidemanAlbums,
  fetchArtistConnections,
  fetchSimilarArtists,
  type ArtistHeader,
  type EssentialListeningAlbum,
  type ArtistConnections,
  type SimilarArtist,
} from "@/lib/artists";
import type { VocabularyTag } from "@/lib/albums";
import { likeEntity, unlikeEntity } from "@/lib/likes";

// Multi-paragraph block text uses blank lines between paragraphs — real
// line breaks when typing it are preserved in the data, but a plain <p>
// just collapses them like any other whitespace. Split on them so
// multi-paragraph block text actually renders as separate paragraphs.
function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

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
    <div className="flex items-start gap-5 border-b border-[rgba(233,230,223,.18)] py-3.5 last:border-b-0">
      <span className="mt-1 w-[130px] flex-none font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.55)]">
        {label}
      </span>
      <span className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag.code}
            className="rounded-full border-[1.5px] border-[#d99b10] px-2.5 py-1.5 text-[12px] font-semibold"
          >
            {tag.label}
          </span>
        ))}
      </span>
    </div>
  );
}

// One curated-album card, shared by "Essential listening" and "Sideman
// albums" — same card, different data source. artistName/artistId/
// totalTracks/logNumber all describe the ALBUM (its leader), not
// necessarily the artist whose page this is.
function AlbumCard({ album }: { album: EssentialListeningAlbum }) {
  return (
    <Link
      href={`/editorial/album?id=${album.id}`}
      className="relative z-10 flex flex-col overflow-hidden rounded-2xl border border-[rgba(233,230,223,.15)] bg-[rgba(233,230,223,.03)] no-underline transition-colors hover:border-[#d99b10] hover:bg-[rgba(217,155,16,.05)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#2a2621]">
        <Cover imageUrl={album.imageUrl} alt={album.name} className="h-full w-full" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="font-[family-name:var(--font-dm-mono)] text-[9.5px] font-medium uppercase tracking-[.12em] text-[rgba(233,230,223,.5)]">
          {album.artistName}
          {album.releaseYear ? ` · ${album.releaseYear}` : ""}
          {album.label ? ` · ${album.label}` : ""}
        </span>
        <div className="text-balance mt-2.5 text-[20px] leading-[1.15] font-extrabold tracking-[-.03em] text-[#e9e6df]">
          {album.name}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <AverageStars value={album.avgRating ?? 0} size={15} />
          <span className="text-[14px] font-extrabold tracking-[-.02em]">
            {album.avgRating ? album.avgRating.toFixed(1) : "—"}
          </span>
        </div>
        {album.dek && (
          <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-[1.55] text-[rgba(233,230,223,.7)]">
            {album.dek}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4 font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.45)]">
          <span>{album.totalTracks ? `${album.totalTracks} tracks` : ""}</span>
          {album.logNumber && (
            <span className="text-[#d99b10]">LOG #{album.logNumber}</span>
          )}
        </div>
      </div>
    </Link>
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
        className="aspect-square w-[120px] rounded-full"
      />
      <div className="text-[16px] font-extrabold tracking-[-.02em] text-[#e9e6df]">
        {artist.name}
      </div>
      {artist.reason && (
        <p className="m-0 line-clamp-3 max-w-[180px] text-[12.5px] leading-[1.5] text-[rgba(233,230,223,.6)]">
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
  const [essentialListening, setEssentialListening] =
    useState<Page<EssentialListeningAlbum> | null>(null);
  const [essentialListeningPage, setEssentialListeningPage] = useState(0);
  const [sidemanAlbums, setSidemanAlbums] =
    useState<Page<EssentialListeningAlbum> | null>(null);
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

  // Independent of the header above — a curated, oldest-first list of entry
  // points into this artist's catalogue. Comes back empty (not an error)
  // for an artist nobody's curated one for yet.
  useEffect(() => {
    if (!id) return;
    fetchEssentialListening(id, essentialListeningPage)
      .then(setEssentialListening)
      .catch(() => {});
  }, [id, essentialListeningPage]);

  // Independent of essential listening — albums where this artist shows up
  // as a sideman rather than as the leader. Also comes back empty (not an
  // error) rather than 404ing for an artist with none.
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

  const editorial = artist.editorial;

  function handleEditorialLikeToggle(next: boolean) {
    if (!editorial) return;
    setArtist(
      (a) =>
        a &&
        a.editorial && {
          ...a,
          editorial: {
            ...a.editorial,
            likedByCurrentUser: next,
            likeCount: a.editorial.likeCount + (next ? 1 : -1),
          },
        },
    );
    (next ? likeEntity : unlikeEntity)("EDITORIAL", editorial.id).catch(() => {
      // Roll back the optimistic count/flag on failure.
      setArtist(
        (a) =>
          a &&
          a.editorial && {
            ...a,
            editorial: {
              ...a.editorial,
              likedByCurrentUser: !next,
              likeCount: a.editorial.likeCount + (next ? -1 : 1),
            },
          },
      );
    });
  }

  return (
    <>
      <Navbar />

      <div className="animate-[jazzlogs-fade-up_.6s_ease-out]">
      <div className="flex justify-between border-y border-[#d99b10] py-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em]">
        <Link href="/archive" className="no-underline">
          ← Editorials · Artists
        </Link>
      </div>

      <div className="grid grid-cols-1 items-center gap-9 pt-11 pb-6 md:grid-cols-[1fr_360px]">
        <div>
          <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.24em] text-[rgba(233,230,223,.6)]">
            Artist editorial
          </div>
          <div className="mt-5 text-[52px] leading-[.9] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[72px]">
            {editorial?.title ?? artist.name}
          </div>
          {editorial && (
            <div className="mt-4 text-[19px] font-semibold tracking-[-.01em] text-[rgba(233,230,223,.75)]">
              {artist.name}
            </div>
          )}
          {editorial?.dek && (
            <div className="mt-5 max-w-[500px] text-[20px] leading-[1.42] font-medium tracking-[-.015em]">
              {editorial.dek}
            </div>
          )}
          {editorial?.byline && (
            <div className="mt-5 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.55)]">
              By {editorial.byline}
            </div>
          )}
          {editorial && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <LikeButton
                initialCount={editorial.likeCount}
                initialLiked={editorial.likedByCurrentUser}
                hideCount
                onToggle={handleEditorialLikeToggle}
              />
              <div className="flex items-center gap-2 text-[28px] font-extrabold tracking-[-.03em] text-[#e0392b]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#e0392b"
                  stroke="#e0392b"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {editorial.likeCount}
              </div>
            </div>
          )}
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
              className="mt-4 flex items-center justify-center gap-2.5 rounded-full bg-black px-6 py-[15px] text-[14px] font-bold text-[#e9e6df] no-underline"
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

      {editorial ? (
        editorial.blocks.length > 0 && (
          <div className="mx-auto mt-11 max-w-[680px]">
            {editorial.blocks.map((b, i) => (
              <div key={i}>
                {b.subhead && (
                  <div className="mt-10 mb-5 text-[26px] font-extrabold leading-[1.1] tracking-[-.03em]">
                    {b.subhead}
                  </div>
                )}
                {b.type === "LEAD" ? (
                  splitParagraphs(b.text).map((para, pi) => (
                    <p key={pi} className="mb-9 text-[18px] leading-[1.75]">
                      {pi === 0 ? (
                        <>
                          <span className="float-left mt-1.5 mr-3.5 text-[60px] leading-[.68] font-extrabold tracking-[-.03em]">
                            {para.charAt(0)}
                          </span>
                          {para.slice(1)}
                        </>
                      ) : (
                        para
                      )}
                    </p>
                  ))
                ) : b.type === "QUOTE" ? (
                  <div className="my-9 border-y-[2.5px] border-[#d99b10] py-8 text-[34px] leading-[1.2] font-semibold tracking-[-.03em] sm:text-[40px]">
                    “{b.text}”
                  </div>
                ) : (
                  splitParagraphs(b.text).map((para, pi) => (
                    <p
                      key={pi}
                      className="mb-9 text-[18px] leading-[1.75] text-[rgba(233,230,223,.9)]"
                    >
                      {para}
                    </p>
                  ))
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <EmptyState
          className="mt-11"
          title="No editorial yet."
          subtitle="Nobody's written this artist up yet — check back later."
        />
      )}

      {/* Field notes — instruments/styles/contexts from GET
          /artists/{id}/connections. similarArtists/albumAppearances/
          trackAppearances aren't here anymore; those get their own
          endpoint(s) later. */}
      {connections &&
        (connections.instruments.length > 0 ||
          connections.styles.length > 0 ||
          connections.contexts.length > 0) && (
          <div className="mx-auto mt-8 max-w-[680px] overflow-hidden rounded-2xl border-[1.5px] border-[#d99b10]">
            <div className="border-b-[1.5px] border-[#d99b10] px-6 py-4">
              <span className="text-[16px] font-extrabold tracking-[-.01em]">
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

      <div className="mt-14 grid grid-cols-1 items-center gap-8 rounded-2xl bg-[#2a2621] p-9 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.2em] text-[#d99b10]">
            Go deeper
          </div>
          <div className="mt-3 text-[30px] font-extrabold leading-[1.05] tracking-[-.03em]">
            Ask the agent where to go next with {artist.name}.
          </div>
        </div>
        <Link
          href="/agent"
          className="rounded-full bg-[#d99b10] px-7 py-[17px] text-[15px] font-bold whitespace-nowrap text-[#1c1b18] no-underline"
        >
          Open the agent →
        </Link>
      </div>

      {/* Essential listening — curated entry-point albums, oldest first.
          Note artistName/artistId below are the ALBUM's, not necessarily
          this page's artist (a collaboration or a sideman credit can be
          curated as an entry point too). Hidden entirely (not even the
          heading) until there's something curated to show. */}
      {essentialListening && essentialListening.content.length > 0 && (
        <>
          <div className="mt-20 mb-2 text-[46px] leading-[.9] font-extrabold tracking-[-.045em] text-[#d99b10] sm:text-[60px]">
            Essential listening
          </div>
          <p className="max-w-[620px] text-[17px] leading-[1.6] text-[rgba(233,230,223,.75)]">
            The essential albums to start with.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {essentialListening.content.map((r) => (
              <AlbumCard key={r.id} album={r} />
            ))}
          </div>
          <Pager
            page={essentialListening.number}
            pageCount={essentialListening.totalPages}
            onChange={setEssentialListeningPage}
          />
        </>
      )}

      {/* Sideman albums — where this artist shows up as a sideman, not the
          leader. artistName/artistId/logNumber below describe the album's
          leader, not this page's artist. Same hide-if-empty rule. */}
      {sidemanAlbums && sidemanAlbums.content.length > 0 && (
        <>
          <div className="mt-16 mb-2 text-[46px] leading-[.9] font-extrabold tracking-[-.045em] text-[#d99b10] sm:text-[60px]">
            Sideman albums
          </div>
          <p className="max-w-[620px] text-[17px] leading-[1.6] text-[rgba(233,230,223,.75)]">
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
          <div className="mt-20 mb-2 text-[46px] leading-[.9] font-extrabold tracking-[-.045em] text-[#d99b10] sm:text-[60px]">
            Similar artists
          </div>
          <p className="max-w-[620px] text-[17px] leading-[1.6] text-[rgba(233,230,223,.75)]">
            Hand-picked, not algorithmic — where to go next from {artist.name}.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
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
