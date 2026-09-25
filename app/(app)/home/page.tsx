import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import { MOCK_TRACKS } from "@/lib/mock/catalog";

export const metadata: Metadata = {
  title: "Home — jazzlogs.",
};

const WEEKLY = [
  { no: "01", title: "Acknowledgement", artist: "John Coltrane", album: "A Love Supreme", time: "7:43" },
  { no: "02", title: "Fee-Fi-Fo-Fum", artist: "Wayne Shorter", album: "Speak No Evil", time: "5:52" },
  { no: "03", title: "Better Git It in Your Soul", artist: "Charles Mingus", album: "Mingus Ah Um", time: "7:22" },
  { no: "04", title: "Moanin'", artist: "Art Blakey", album: "Moanin'", time: "9:35" },
  { no: "05", title: "Maiden Voyage", artist: "Herbie Hancock", album: "Maiden Voyage", time: "7:56" },
];

const MOST_LISTENED = [
  { title: "Kind of Blue", artist: "Miles Davis", listeners: "12.4k", plays: 28 },
  { title: "Sunday at the Village Vanguard", artist: "Bill Evans", listeners: "6.1k", plays: 21 },
  { title: "Chet Baker Sings", artist: "Chet Baker", listeners: "8.9k", plays: 17 },
  { title: "A Love Supreme", artist: "John Coltrane", listeners: "10.2k", plays: 14 },
  { title: "Speak No Evil", artist: "Wayne Shorter", listeners: "3.7k", plays: 11 },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <div className="flex items-center justify-between border-y border-[#F6D013] py-3 font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.16em]">
        <span>Thursday, Jul 11, 2026</span>
      </div>

      <div className="py-16 text-center">
        <div className="font-[family-name:var(--font-fraunces)] text-[64px] leading-[.86] font-extrabold tracking-[-.055em] text-[#F6D013] sm:text-[100px] md:text-[132px]">
          jazzlogs.
        </div>
        <div className="mx-auto mt-7 max-w-[540px] font-[family-name:var(--font-newsreader)] text-[20px] leading-[1.5] font-semibold tracking-[-.01em]">
          Welcome back, Miles. Your session&rsquo;s still warm, today&rsquo;s log is in, and the
          agent&rsquo;s read up while you were gone.
        </div>
      </div>

      {/* Today's log */}
      <div className="pb-6">
        <div className="flex items-baseline justify-between border-b-[2.5px] border-[#F6D013] pb-3.5">
          <span className="font-[family-name:var(--font-fraunces)] text-[18px] font-extrabold tracking-[-.01em]">Today&rsquo;s log</span>
          <span className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium tracking-[.14em]">
            #214 · JUL 10
          </span>
        </div>
        <div className="mt-11 grid grid-cols-1 items-stretch gap-8 md:grid-cols-[360px_1fr]">
          <div className="flex h-[360px] w-full flex-col justify-between rounded-[18px] bg-[#2A261C] p-7 text-[#F6D013] md:w-[360px]">
            <div className="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium text-[#E8DCC0]">
              IMPULSE! · 1965
            </div>
            <div className="font-[family-name:var(--font-fraunces)] text-[44px] leading-[.86] font-extrabold tracking-[-.03em] text-[#E8DCC0] sm:text-[52px]">
              A Love Supreme
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="font-[family-name:var(--font-fraunces)] text-[38px] leading-[.96] font-extrabold tracking-[-.045em] text-[#F6D013] sm:text-[54px]">
              A vow in four movements
            </div>
            <div className="mt-4 font-[family-name:var(--font-dm-sans)] text-[12px] font-medium uppercase tracking-[.1em] text-[rgba(232,220,192,.7)]">
              John Coltrane · Modal / Spiritual
            </div>
            <p className="mt-5 max-w-[620px] font-[family-name:var(--font-newsreader)] text-[18px] leading-[1.65] text-[rgba(232,220,192,.82)]">
              Four movements that move from acknowledgement to psalm — the record we point
              newcomers to, and the one lifers keep returning to.
            </p>
            <div className="mt-6 flex gap-6 border-t border-[rgba(232,220,192,.2)] pt-5">
              <div>
                <div className="font-[family-name:var(--font-dm-sans)] text-[10px] font-medium text-[rgba(232,220,192,.55)]">
                  RUNTIME
                </div>
                <div className="mt-2 text-[22px] font-extrabold tracking-[-.02em]">33 min</div>
              </div>
              <div>
                <div className="font-[family-name:var(--font-dm-sans)] text-[10px] font-medium text-[rgba(232,220,192,.55)]">
                  LABEL
                </div>
                <div className="mt-2 text-[22px] font-extrabold tracking-[-.02em]">Impulse!</div>
              </div>
            </div>
            <Link
              href="/editorial/track"
              className="mt-6 inline-block self-start rounded-full bg-[#2A261C] px-6 py-[15px] text-[15px] font-bold text-[#E8DCC0] no-underline"
            >
              Read the full log →
            </Link>
          </div>
        </div>
      </div>

      {/* Weekly playlist */}
      <div className="mt-11 border-t-4 border-double border-[#1C1A14] pt-9">
        <div className="border-b-[2.5px] border-[#F6D013] pb-5">
          <span className="font-[family-name:var(--font-fraunces)] text-[36px] leading-[.98] font-extrabold tracking-[-.04em] text-[#F6D013] sm:text-[44px]">
            The Weekly JazzLogs
          </span>
          <div className="mt-4 max-w-[620px] font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.6] text-[rgba(232,220,192,.72)]">
            One playlist a week, pulling the standout track from every album we logged — seven
            days of listening in a single sitting.
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 items-stretch gap-8 md:grid-cols-[360px_1fr]">
          <div className="flex min-h-[300px] flex-col justify-between rounded-[18px] bg-[#2A261C] p-7 text-[#E8DCC0]">
            <div className="flex justify-between font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium text-[rgba(232,220,192,.6)]">
              <span>WEEK 28</span>
              <span>JUL 4 – 10</span>
            </div>
            <div>
              <div className="font-[family-name:var(--font-fraunces)] text-[40px] leading-[.9] font-extrabold tracking-[-.04em] text-[#F6D013] sm:text-[48px]">
                The Weekly JazzLogs
              </div>
              <div className="mt-4 font-[family-name:var(--font-newsreader)] text-[15px] leading-[1.55] text-[rgba(232,220,192,.78)]">
                7 tracks · 54 min · one from each of the week&rsquo;s logs.
              </div>
            </div>
            <Link
              href="/playlists/detail"
              className="inline-block self-start rounded-full bg-[#F6D013] px-6 py-3.5 text-[14px] font-bold text-[#1C1A14] no-underline"
            >
              Open playlist
            </Link>
          </div>
          <div>
            {WEEKLY.map((w) => (
              <div
                key={w.no}
                className="grid grid-cols-[34px_1fr_auto_auto] items-baseline gap-5 border-b border-[rgba(232,220,192,.2)] py-3.5"
              >
                <span className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[rgba(232,220,192,.5)]">
                  {w.no}
                </span>
                <span>
                  <span className="text-[18px] font-bold tracking-[-.01em]">{w.title}</span>{" "}
                  <span className="text-[13px] font-medium text-[rgba(232,220,192,.6)]">
                    — {w.artist}
                  </span>
                </span>
                <span className="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium text-[rgba(232,220,192,.5)]">
                  from {w.album}
                </span>
                <span className="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium text-[rgba(232,220,192,.55)]">
                  {w.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured tracks */}
      <div className="mt-14 border-t-4 border-double border-[#1C1A14] pt-9">
        <div className="border-b-[2.5px] border-[#F6D013] pb-5">
          <span className="font-[family-name:var(--font-fraunces)] text-[36px] leading-[.98] font-extrabold tracking-[-.04em] text-[#F6D013] sm:text-[44px]">
            Featured tracks of the week
          </span>
          <div className="mt-4 max-w-[620px] font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.6] text-[rgba(232,220,192,.72)]">
            Ten tracks we kept coming back to this week — pulled from the log, the sessions and
            the archive.
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2">
          {MOCK_TRACKS.map((t, i) => (
            <Link
              key={t.id}
              href="/editorial/track"
              className="grid grid-cols-[34px_1fr_auto] items-baseline gap-5 rounded-2xl px-5 py-5 no-underline hover:bg-[rgba(246,208,19,.18)]"
            >
              <span className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[rgba(232,220,192,.5)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="text-[18px] font-bold tracking-[-.01em]">{t.title}</span>{" "}
                <span className="text-[13.5px] font-medium text-[rgba(232,220,192,.6)]">
                  — {t.artist}
                </span>
              </span>
              <span className="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium text-[rgba(232,220,192,.55)]">
                {t.duration}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Most listened */}
      <div className="mt-14 border-t-4 border-double border-[#1C1A14] pt-9">
        <div className="border-b-[2.5px] border-[#F6D013] pb-5">
          <span className="font-[family-name:var(--font-fraunces)] text-[36px] leading-[.98] font-extrabold tracking-[-.04em] text-[#F6D013] sm:text-[44px]">
            Most listened this week
          </span>
          <div className="mt-4 max-w-[620px] font-[family-name:var(--font-newsreader)] text-[16px] leading-[1.6] text-[rgba(232,220,192,.72)]">
            The records that kept pulling you back this week — your five most-played.
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {MOST_LISTENED.map((m) => (
            <div
              key={m.title}
              className="flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-[#F6D013]"
            >
              <div className="aspect-square">
                <ImagePlaceholder label="Cover" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="font-[family-name:var(--font-fraunces)] text-[20px] leading-[.98] font-extrabold tracking-[-.02em]">
                  {m.title}
                </div>
                <div className="mt-1.5 text-[12px] font-semibold text-[rgba(232,220,192,.62)]">
                  {m.artist}
                </div>
                <div className="mt-auto flex items-baseline gap-3.5 pt-3.5">
                  <div>
                    <div className="text-[22px] font-extrabold tracking-[-.02em] text-[#F6D013]">
                      {m.listeners}
                    </div>
                    <div className="mt-1 font-[family-name:var(--font-dm-sans)] text-[9px] font-medium text-[rgba(232,220,192,.5)]">
                      LISTENED
                    </div>
                  </div>
                  <div>
                    <div className="text-[22px] font-extrabold tracking-[-.02em]">{m.plays}</div>
                    <div className="mt-1 font-[family-name:var(--font-dm-sans)] text-[9px] font-medium text-[rgba(232,220,192,.5)]">
                      THIS WEEK
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
