import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import { MOCK_ALBUMS, MOCK_PLAYLISTS, MOCK_TRACKS } from "@/lib/mock/catalog";

export default function ListenLaterPage() {
  return (
    <>
      <Navbar />

      <div className="border-t border-[#F6D013] py-3 font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.6)]">
        <Link href="/logs" className="no-underline">
          Your logs
        </Link>{" "}
        / Listen later
      </div>

      <div className="pt-11 pb-2.5">
        <div className="font-[family-name:var(--font-fraunces)] text-[56px] leading-[.9] font-extrabold tracking-[-.05em] text-[#F6D013] sm:text-[80px]">
          Listen later.
        </div>
        <div className="mt-5 max-w-[600px] font-[family-name:var(--font-newsreader)] text-[19px] leading-[1.5] text-[rgba(232,220,192,.72)]">
          Everything you&rsquo;ve set aside to hear when there&rsquo;s time — the records worth a
          full sitting and the single cuts you didn&rsquo;t want to lose.
        </div>
      </div>

      <div className="mt-9 flex items-baseline gap-3.5 border-t-2 border-[#F6D013] pt-5">
        <span className="font-[family-name:var(--font-fraunces)] text-[30px] font-extrabold tracking-[-.03em] text-[#F6D013]">
          Playlists
        </span>
        <span className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.55)]">
          {MOCK_PLAYLISTS.slice(0, 3).length} to hear
        </span>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {MOCK_PLAYLISTS.slice(0, 3).map((p) => (
          <Link key={p.id} href="/playlists/detail" className="block no-underline">
            <div className="aspect-square overflow-hidden rounded-2xl">
              <ImagePlaceholder label="Playlist cover" />
            </div>
            <div className="pt-3.5">
              <div className="font-[family-name:var(--font-fraunces)] text-[24px] leading-[1.02] font-extrabold tracking-[-.03em]">
                {p.title}
              </div>
              <div className="mt-2 text-[13px] font-semibold text-[rgba(232,220,192,.62)]">
                {p.note}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-14 flex items-baseline gap-3.5 border-t-2 border-[#F6D013] pt-5">
        <span className="font-[family-name:var(--font-fraunces)] text-[30px] font-extrabold tracking-[-.03em] text-[#F6D013]">
          Albums
        </span>
        <span className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.55)]">
          {MOCK_ALBUMS.length} to hear
        </span>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {MOCK_ALBUMS.slice(0, 6).map((a) => (
          <Link key={a.id} href="/editorial/track" className="block no-underline">
            <div className="aspect-square overflow-hidden rounded-2xl">
              <ImagePlaceholder label="Album cover" />
            </div>
            <div className="pt-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-[family-name:var(--font-fraunces)] text-[24px] font-extrabold tracking-[-.03em]">{a.title}</div>
                <span className="flex-none font-[family-name:var(--font-dm-sans)] text-[10px] text-[rgba(232,220,192,.5)]">
                  {a.year}
                </span>
              </div>
              <div className="mt-2 text-[13px] font-semibold text-[rgba(232,220,192,.62)]">
                {a.artist}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-14 flex items-baseline gap-3.5 border-t-2 border-[#F6D013] pt-5">
        <span className="font-[family-name:var(--font-fraunces)] text-[30px] font-extrabold tracking-[-.03em] text-[#F6D013]">
          Tracks
        </span>
        <span className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.14em] text-[rgba(232,220,192,.55)]">
          {MOCK_TRACKS.length} to hear
        </span>
      </div>
      {MOCK_TRACKS.map((t, i) => (
        <div
          key={t.id}
          className="grid grid-cols-[36px_44px_1fr_auto] items-center gap-5 border-t border-[rgba(232,220,192,.2)] py-3.5 sm:grid-cols-[44px_52px_1fr_180px_auto]"
        >
          <span className="text-[20px] font-extrabold tracking-[-.02em] text-[rgba(232,220,192,.4)]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="h-[44px] w-[44px] overflow-hidden rounded-md border-[1.5px] border-[#F6D013] sm:h-[52px] sm:w-[52px]">
            <ImagePlaceholder label="♪" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[16px] font-bold tracking-[-.01em] sm:text-[18px]">
              {t.title}
            </div>
            <div className="mt-1 text-[12px] font-semibold text-[rgba(232,220,192,.6)]">
              {t.artist} · {t.duration}
            </div>
          </div>
          <Link
            href="/editorial/track"
            className="hidden truncate text-[13px] font-medium text-[rgba(232,220,192,.72)] no-underline sm:block"
          >
            {t.album}{" "}
            <span className="font-[family-name:var(--font-dm-sans)] text-[10px] text-[rgba(232,220,192,.45)]">
              · {t.year}
            </span>
          </Link>
        </div>
      ))}

      <Footer />
    </>
  );
}
