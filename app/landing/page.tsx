import Link from "next/link";
import type { Metadata } from "next";
import { archivo, dmMono } from "@/lib/fonts";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import { MOCK_ALBUMS, MOCK_PLAYLISTS, MOCK_SERIES } from "@/lib/mock/catalog";

export const metadata: Metadata = {
  title: "jazzlogs. — the daily jazz journal",
};

export default function LandingPage() {
  return (
    <div
      className={`${archivo.variable} ${dmMono.variable} min-h-screen bg-[#d99b10] font-[family-name:var(--font-archivo)]`}
    >
      <div className="mx-auto flex min-h-screen max-w-[1180px] flex-col bg-[#1c1b18] text-[#e9e6df]">
        {/* Navbar */}
        <div className="flex items-center justify-between px-6 pt-8 sm:px-14">
          <span className="text-[25px] font-extrabold tracking-[-.03em] text-[#d99b10]">
            jazzlogs.
          </span>
          <div className="hidden gap-[30px] text-[13px] font-semibold sm:flex">
            <Link href="/archive" className="no-underline">
              Editorials
            </Link>
            <Link href="/playlists" className="no-underline">
              Playlists
            </Link>
            <Link href="/series" className="no-underline">
              Series
            </Link>
            <Link href="/login" className="text-[rgba(233,230,223,.55)] no-underline">
              Sign in
            </Link>
          </div>
        </div>

        {/* Dateline strip */}
        <div className="mx-6 mt-6 grid grid-cols-3 items-center border-y border-[#d99b10] px-0 py-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em] sm:mx-14">
          <span className="text-left">214 LOGS</span>
          <span className="text-center">The daily jazz journal</span>
          <span className="text-right">Jul 10, 2026</span>
        </div>

        {/* Masthead hero */}
        <div className="px-6 pt-12 pb-16 text-center sm:px-14">
          <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.32em]">
            JAZZ EDITORIALS
          </div>
          <div className="mt-6 text-[68px] leading-[.86] font-extrabold tracking-[-.055em] text-[#d99b10] sm:text-[100px] md:text-[138px]">
            jazzlogs.
          </div>
          <div className="mx-auto mt-6 max-w-[600px] text-[21px] leading-[1.45] font-semibold tracking-[-.01em]">
            Exploring jazz through curated editorials, immersive listening sessions, and
            conversation with your AI jazz companion.
          </div>
          <div className="mt-11 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/editorial/album"
              className="rounded-full bg-[#d99b10] px-8 py-[17px] text-[14.5px] font-bold text-[#1c1b18] no-underline"
            >
              Read latest log
            </Link>
            <Link
              href="/archive"
              className="rounded-full border-[1.5px] border-[#d99b10] px-8 py-[17px] text-[14.5px] font-bold text-[#e9e6df] no-underline"
            >
              Browse the archive
            </Link>
          </div>
        </div>

        {/* Today's log */}
        <div className="border-t border-[#d99b10] px-6 pt-11 pb-14 sm:px-14">
          <div className="flex items-baseline justify-between border-b-[1.5px] border-[#d99b10] pb-3">
            <span className="text-[16px] font-extrabold tracking-[-.01em]">
              Every jazz album tells a story.
            </span>
            <span className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium tracking-[.16em]">
              NEW · LOG #214
            </span>
          </div>
          <Link
            href="/editorial/album"
            className="mt-8 grid grid-cols-1 items-stretch gap-8 no-underline md:grid-cols-[360px_1fr]"
          >
            <div className="aspect-square overflow-hidden rounded-[18px]">
              <ImagePlaceholder label="Today's cover" />
            </div>
            <div className="flex flex-col text-left">
              <div className="text-[40px] leading-[.96] font-extrabold tracking-[-.03em] text-[#d99b10] sm:text-[52px]">
                A vow in four movements
              </div>
              <div className="mt-3.5 font-[family-name:var(--font-dm-mono)] text-[13px] font-medium tracking-[.12em] uppercase text-[rgba(233,230,223,.72)]">
                John Coltrane · Impulse! · 1965 · Modal / Spiritual jazz
              </div>
              <p className="mt-6 max-w-[560px] text-[16px] leading-[1.65] text-[#e9e6df]">
                Recorded across a single December session in 1964, A Love Supreme is less an
                album than a vow — four movements that move from acknowledgement to psalm.
                Coltrane&rsquo;s quartet plays like it&rsquo;s testifying.
              </p>
              <span className="mt-auto inline-block self-start border-b-2 border-[#d99b10] pt-6 pb-1 text-[14px] font-bold">
                Read the full log →
              </span>
            </div>
          </Link>
        </div>

        {/* Archive feed */}
        <div className="border-t border-[#d99b10] px-6 py-16 sm:px-14">
          <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <div className="text-[48px] leading-[.9] font-extrabold tracking-[-.045em] text-[#d99b10] sm:text-[68px]">
                Browse the
                <br />
                archive.
              </div>
              <div className="mt-5 max-w-[440px] text-[16px] leading-[1.6] text-[rgba(233,230,223,.72)]">
                Explore all editorials from jazzlogs — every record we&rsquo;ve logged since day
                one, filed by date and open to read in full.
              </div>
            </div>
            <div className="pb-2 text-right">
              <div className="text-[64px] leading-[.82] font-extrabold tracking-[-.05em] sm:text-[84px]">
                214
              </div>
              <div className="mt-2.5 font-[family-name:var(--font-dm-mono)] text-[11px] font-medium tracking-[.16em] uppercase text-[rgba(233,230,223,.62)]">
                LOGS
              </div>
              <Link
                href="/archive"
                className="mt-5 inline-block border-b-2 border-[#d99b10] pb-[3px] text-[13px] font-bold no-underline"
              >
                Enter the archive →
              </Link>
            </div>
          </div>

          <div className="mt-10 flex gap-5 overflow-x-auto pb-3.5">
            {MOCK_ALBUMS.map((a, i) => (
              <Link
                key={a.id}
                href="/editorial/album"
                className="flex w-[280px] flex-none flex-col overflow-hidden rounded-[18px] border-[1.5px] border-[#d99b10] no-underline"
              >
                <div className="aspect-square">
                  <ImagePlaceholder label="Cover" />
                </div>
                <div className="flex flex-col gap-3.5 px-5 py-5">
                  <div className="flex items-baseline justify-between font-[family-name:var(--font-dm-mono)] text-[10px] font-medium tracking-[.14em] text-[rgba(233,230,223,.55)]">
                    <span>LOG #{213 - i}</span>
                    <span>{a.year}</span>
                  </div>
                  <div>
                    <div className="text-[28px] leading-[.95] font-extrabold tracking-[-.03em]">
                      {a.title}
                    </div>
                    <div className="mt-2 text-[14px] font-semibold text-[rgba(233,230,223,.7)]">
                      {a.artist}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[rgba(233,230,223,.25)] pt-3">
                    <span className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium text-[rgba(233,230,223,.6)]">
                      {a.label}
                    </span>
                    <span className="text-[13px] font-bold">Read →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Playlists */}
        <div className="bg-[#2a2621] px-6 py-16 text-[#e9e6df] sm:px-14">
          <div className="mb-11 grid grid-cols-1 items-end gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <div className="text-[42px] leading-[.9] font-extrabold tracking-[-.045em] text-[#d99b10] sm:text-[60px]">
                Playlists to
                <br />
                get lost in.
              </div>
              <div className="mt-5 max-w-[460px] text-[16px] leading-[1.6] text-[rgba(233,230,223,.78)]">
                Hand-built lists for a mood, a moment or a rabbit hole — start anywhere and let
                one record lead to the next.
              </div>
            </div>
            <Link
              href="/playlists"
              className="border-b-2 border-[#d99b10] pb-[3px] text-right text-[13px] font-bold text-[#d99b10] no-underline"
            >
              Browse all playlists →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {MOCK_PLAYLISTS.slice(0, 3).map((p) => (
              <Link
                key={p.id}
                href="/playlists/detail"
                className="flex min-h-[230px] flex-col justify-between rounded-2xl border-[1.5px] border-[rgba(233,230,223,.32)] p-6 text-[#e9e6df] no-underline hover:border-[#d99b10] hover:bg-[#d99b10] hover:text-[#1c1b18]"
              >
                <span className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium tracking-[.14em] opacity-70">
                  {p.count} TRACKS
                </span>
                <div>
                  <div className="text-[28px] leading-[.98] font-extrabold tracking-[-.03em]">
                    {p.title}
                  </div>
                  <div className="mt-3 text-[14px] opacity-80">{p.note}</div>
                </div>
                <span className="text-[13px] font-bold">Play →</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Agent */}
        <div className="px-6 py-20 sm:px-14">
          <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
            <div className="text-[52px] leading-[.9] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[72px]">
              jazzlogs agent
            </div>
            <div className="mt-5 max-w-[560px] text-[19px] leading-[1.55] text-[rgba(233,230,223,.72)]">
              Like ChatGPT, but it only listens to jazz. Ask for a recommendation, a comparison,
              or the story behind any record, and it cites the logs it draws from.
            </div>
            <div className="mt-10 w-full max-w-[640px]">
              <div className="flex items-center gap-2.5 rounded-[26px] border-[1.5px] border-[#d99b10] bg-[#d99b10] p-2">
                <span className="flex-1 pl-4 text-left text-[15px] font-medium text-[rgba(28,27,24,.5)]">
                  Ask about any record, artist or era…
                </span>
                <Link
                  href="/agent"
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#1c1b18] text-[18px] font-bold text-[#e9e6df] no-underline"
                >
                  ↑
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Series */}
        <div className="bg-[#2a2621] px-6 py-16 text-[#e9e6df] sm:px-14">
          <div className="mb-11 grid grid-cols-1 items-end gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.24em] text-[#d99b10]">
                Guided listening · hand-made
              </div>
              <div className="mt-4 text-[42px] leading-[.9] font-extrabold tracking-[-.045em] text-[#d99b10] sm:text-[60px]">
                JazzLogs
                <br />
                series.
              </div>
            </div>
            <Link
              href="/series"
              className="border-b-2 border-[#d99b10] pb-[3px] text-right text-[13px] font-bold text-[#d99b10] no-underline"
            >
              Browse all series →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {MOCK_SERIES.slice(0, 3).map((s) => (
              <Link
                key={s.id}
                href="/series/detail"
                className="flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-[#d99b10] no-underline"
              >
                <div className="aspect-[16/10]">
                  <ImagePlaceholder label="Cover" />
                </div>
                <div className="flex flex-col gap-2.5 px-5 py-5">
                  <div className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium tracking-[.12em] uppercase text-[rgba(233,230,223,.6)]">
                    {s.chapters} chapters · {s.duration}
                  </div>
                  <div className="text-[24px] leading-[.98] font-extrabold tracking-[-.03em]">
                    {s.title}
                  </div>
                  <div className="text-[13.5px] text-[rgba(233,230,223,.78)]">{s.note}</div>
                  <span className="mt-1 text-[13px] font-bold text-[#d99b10]">
                    Start series →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Log your journey */}
        <div className="border-t border-[#d99b10] px-6 py-16 sm:px-14">
          <div className="max-w-[720px]">
            <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.24em] text-[rgba(233,230,223,.6)]">
              Your desk at jazzlogs
            </div>
            <div className="mt-4 text-[48px] leading-[.9] font-extrabold tracking-[-.045em] text-[#d99b10] sm:text-[64px]">
              Log your
              <br />
              journey.
            </div>
          </div>
          <div className="mt-11 grid grid-cols-1 border-t-[1.5px] border-[#d99b10] sm:grid-cols-4">
            {[
              ["01", "Save what you find", "Bookmark any song or album as you go."],
              ["02", "Write jazz reviews", "Rate a record and put your listening into words."],
              ["03", "Build playlists", "Collect tracks into lists for any mood or moment."],
              ["04", "Share with friends", "Send a review or a playlist to anyone."],
            ].map(([no, title, desc]) => (
              <div key={no} className="border-r border-[rgba(233,230,223,.25)] py-7 pr-6 last:border-r-0">
                <div className="font-[family-name:var(--font-dm-mono)] text-[12px] font-medium text-[rgba(233,230,223,.55)]">
                  {no}
                </div>
                <div className="mt-4 text-[24px] leading-[1.02] font-extrabold tracking-[-.03em]">
                  {title}
                </div>
                <div className="mt-3 text-[14px] leading-[1.6] text-[rgba(233,230,223,.72)]">
                  {desc}
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/logs"
            className="mt-10 inline-block rounded-full bg-[#d99b10] px-7 py-4 text-[14px] font-bold text-[#1c1b18] no-underline"
          >
            Open your logs →
          </Link>
        </div>

        {/* Plans */}
        <div className="px-6 py-14 sm:px-14">
          <div className="mb-10 text-center">
            <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.28em]">
              Two ways to listen
            </div>
            <div className="mt-4 text-[36px] font-extrabold tracking-[-.03em] text-[#d99b10] sm:text-[44px]">
              Pick your seat.
            </div>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2">
            <div className="flex flex-col rounded-[18px] border-[1.5px] border-[#d99b10] p-8">
              <div className="flex items-baseline justify-between border-b border-[#d99b10] pb-4">
                <span className="text-[22px] font-extrabold tracking-[-.02em]">Free</span>
                <span className="text-[22px] font-extrabold tracking-[-.02em]">$0</span>
              </div>
              <div className="my-4 text-[13px] font-medium text-[rgba(233,230,223,.75)]">
                Everything editorial, forever.
              </div>
              <div className="flex flex-1 flex-col gap-3 text-[14px] font-medium">
                <div className="flex gap-2.5">
                  <span>—</span>
                  <span>The daily log, every day</span>
                </div>
                <div className="flex gap-2.5">
                  <span>—</span>
                  <span>Full 214-log archive</span>
                </div>
                <div className="flex gap-2.5">
                  <span>—</span>
                  <span>Album, track &amp; artist reviews</span>
                </div>
              </div>
              <Link
                href="/register"
                className="mt-6 rounded-full border-[1.5px] border-[#d99b10] py-[15px] text-center text-[14px] font-bold text-[#e9e6df] no-underline"
              >
                Start reading
              </Link>
            </div>
            <div className="flex flex-col rounded-[18px] bg-[#2a2621] p-8 text-[#e9e6df]">
              <div className="flex items-baseline justify-between border-b border-[rgba(233,230,223,.3)] pb-4">
                <span className="text-[22px] font-extrabold tracking-[-.02em] text-[#d99b10]">
                  JazzLog Member
                </span>
                <span className="text-[22px] font-extrabold tracking-[-.02em]">
                  $6<span className="font-[family-name:var(--font-dm-mono)] text-[12px]">/mo</span>
                </span>
              </div>
              <div className="my-4 text-[13px] font-medium text-[rgba(233,230,223,.75)]">
                Everything in Free, plus the intelligence.
              </div>
              <div className="flex flex-1 flex-col gap-3 text-[14px] font-medium">
                <div className="flex gap-2.5">
                  <span className="text-[#d99b10]">+</span>
                  <span>AI jazz agent, trained on the catalogue</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-[#d99b10]">+</span>
                  <span>Narrated listening sessions</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-[#d99b10]">+</span>
                  <span>Semantic search &amp; early logs</span>
                </div>
              </div>
              <Link
                href="/register"
                className="mt-6 rounded-full bg-[#d99b10] py-[15px] text-center text-[14px] font-bold text-[#1c1b18] no-underline"
              >
                Become a member
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-[#d99b10] px-6 pt-11 pb-10 sm:px-14">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="text-[36px] font-extrabold tracking-[-.045em] text-[#d99b10]">
                jazzlogs.
              </div>
              <div className="mt-3 max-w-[260px] text-[13px] font-semibold leading-[1.4]">
                For people who listen closely. One record a day.
              </div>
            </div>
            <div className="flex gap-10 text-[13px] font-semibold leading-[1.9]">
              <div className="flex flex-col">
                <span className="mb-2 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] opacity-55">
                  Explore
                </span>
                <span>Today&rsquo;s log</span>
                <span>Archive</span>
                <span>Series</span>
              </div>
              <div className="flex flex-col">
                <span className="mb-2 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] opacity-55">
                  More
                </span>
                <span>Plans</span>
                <span>The agent</span>
                <span>Instagram</span>
              </div>
            </div>
          </div>
          <div className="mt-9 flex justify-between border-t border-[#d99b10] pt-4 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.12em]">
            <span>© 2026 jazzlogs</span>
            <span>Buenos Aires · daily</span>
          </div>
        </div>
      </div>
    </div>
  );
}
