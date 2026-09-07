import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";
import ImagePlaceholder from "@/components/app/ImagePlaceholder";
import LikeButton from "@/components/app/LikeButton";
import { AverageStars } from "@/components/app/StarRating";
import { MOCK_TRACKS, MOCK_REVIEWS } from "@/lib/mock/catalog";

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

      <div className="flex items-center justify-between border-y border-[#d99b10] py-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em]">
        <span>Thursday, Jul 11, 2026</span>
      </div>

      <div className="py-16 text-center">
        <div className="text-[64px] leading-[.86] font-extrabold tracking-[-.055em] text-[#d99b10] sm:text-[100px] md:text-[132px]">
          jazzlogs.
        </div>
        <div className="mx-auto mt-7 max-w-[540px] text-[20px] leading-[1.5] font-semibold tracking-[-.01em]">
          Welcome back, Miles. Your session&rsquo;s still warm, today&rsquo;s log is in, and the
          agent&rsquo;s read up while you were gone.
        </div>
      </div>

      {/* Today's log */}
      <div className="pb-6">
        <div className="flex items-baseline justify-between border-b-[2.5px] border-[#d99b10] pb-3.5">
          <span className="text-[18px] font-extrabold tracking-[-.01em]">Today&rsquo;s log</span>
          <span className="font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium tracking-[.14em]">
            #214 · JUL 10
          </span>
        </div>
        <div className="mt-11 grid grid-cols-1 items-stretch gap-8 md:grid-cols-[360px_1fr]">
          <div className="flex h-[360px] w-full flex-col justify-between rounded-[18px] bg-[#2a2621] p-7 text-[#d99b10] md:w-[360px]">
            <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-[#e9e6df]">
              IMPULSE! · 1965
            </div>
            <div className="text-[44px] leading-[.86] font-extrabold tracking-[-.03em] text-[#e9e6df] sm:text-[52px]">
              A Love Supreme
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-[38px] leading-[.96] font-extrabold tracking-[-.045em] text-[#d99b10] sm:text-[54px]">
              A vow in four movements
            </div>
            <div className="mt-4 font-[family-name:var(--font-dm-mono)] text-[12px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.7)]">
              John Coltrane · Modal / Spiritual
            </div>
            <p className="mt-5 max-w-[620px] text-[18px] leading-[1.65] text-[rgba(233,230,223,.82)]">
              Four movements that move from acknowledgement to psalm — the record we point
              newcomers to, and the one lifers keep returning to.
            </p>
            <div className="mt-6 flex gap-6 border-t border-[rgba(233,230,223,.2)] pt-5">
              <div>
                <div className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium text-[rgba(233,230,223,.55)]">
                  RUNTIME
                </div>
                <div className="mt-2 text-[22px] font-extrabold tracking-[-.02em]">33 min</div>
              </div>
              <div>
                <div className="font-[family-name:var(--font-dm-mono)] text-[10px] font-medium text-[rgba(233,230,223,.55)]">
                  LABEL
                </div>
                <div className="mt-2 text-[22px] font-extrabold tracking-[-.02em]">Impulse!</div>
              </div>
            </div>
            <Link
              href="/editorial/album"
              className="mt-6 inline-block self-start rounded-full bg-[#2a2621] px-6 py-[15px] text-[15px] font-bold text-[#e9e6df] no-underline"
            >
              Read the full log →
            </Link>
          </div>
        </div>
      </div>

      {/* Weekly playlist */}
      <div className="mt-11 border-t-4 border-double border-[#1c1b18] pt-9">
        <div className="border-b-[2.5px] border-[#d99b10] pb-5">
          <span className="text-[36px] leading-[.98] font-extrabold tracking-[-.04em] text-[#d99b10] sm:text-[44px]">
            The Weekly JazzLogs
          </span>
          <div className="mt-4 max-w-[620px] text-[16px] leading-[1.6] text-[rgba(233,230,223,.72)]">
            One playlist a week, pulling the standout track from every album we logged — seven
            days of listening in a single sitting.
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 items-stretch gap-8 md:grid-cols-[360px_1fr]">
          <div className="flex min-h-[300px] flex-col justify-between rounded-[18px] bg-[#2a2621] p-7 text-[#e9e6df]">
            <div className="flex justify-between font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium text-[rgba(233,230,223,.6)]">
              <span>WEEK 28</span>
              <span>JUL 4 – 10</span>
            </div>
            <div>
              <div className="text-[40px] leading-[.9] font-extrabold tracking-[-.04em] text-[#d99b10] sm:text-[48px]">
                The Weekly JazzLogs
              </div>
              <div className="mt-4 text-[15px] leading-[1.55] text-[rgba(233,230,223,.78)]">
                7 tracks · 54 min · one from each of the week&rsquo;s logs.
              </div>
            </div>
            <Link
              href="/playlists/detail"
              className="inline-block self-start rounded-full bg-[#d99b10] px-6 py-3.5 text-[14px] font-bold text-[#1c1b18] no-underline"
            >
              Open playlist
            </Link>
          </div>
          <div>
            {WEEKLY.map((w) => (
              <div
                key={w.no}
                className="grid grid-cols-[34px_1fr_auto_auto] items-baseline gap-5 border-b border-[rgba(233,230,223,.2)] py-3.5"
              >
                <span className="font-[family-name:var(--font-dm-mono)] text-[13px] text-[rgba(233,230,223,.5)]">
                  {w.no}
                </span>
                <span>
                  <span className="text-[18px] font-bold tracking-[-.01em]">{w.title}</span>{" "}
                  <span className="text-[13px] font-medium text-[rgba(233,230,223,.6)]">
                    — {w.artist}
                  </span>
                </span>
                <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-[rgba(233,230,223,.5)]">
                  from {w.album}
                </span>
                <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-[rgba(233,230,223,.55)]">
                  {w.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured tracks */}
      <div className="mt-14 border-t-4 border-double border-[#1c1b18] pt-9">
        <div className="border-b-[2.5px] border-[#d99b10] pb-5">
          <span className="text-[36px] leading-[.98] font-extrabold tracking-[-.04em] text-[#d99b10] sm:text-[44px]">
            Featured tracks of the week
          </span>
          <div className="mt-4 max-w-[620px] text-[16px] leading-[1.6] text-[rgba(233,230,223,.72)]">
            Ten tracks we kept coming back to this week — pulled from the log, the sessions and
            the archive.
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2">
          {MOCK_TRACKS.map((t, i) => (
            <Link
              key={t.id}
              href="/editorial/album"
              className="grid grid-cols-[34px_1fr_auto] items-baseline gap-5 rounded-2xl px-5 py-5 no-underline hover:bg-[rgba(217,155,16,.18)]"
            >
              <span className="font-[family-name:var(--font-dm-mono)] text-[13px] text-[rgba(233,230,223,.5)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="text-[18px] font-bold tracking-[-.01em]">{t.title}</span>{" "}
                <span className="text-[13.5px] font-medium text-[rgba(233,230,223,.6)]">
                  — {t.artist}
                </span>
              </span>
              <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-[rgba(233,230,223,.55)]">
                {t.duration}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Most listened */}
      <div className="mt-14 border-t-4 border-double border-[#1c1b18] pt-9">
        <div className="border-b-[2.5px] border-[#d99b10] pb-5">
          <span className="text-[36px] leading-[.98] font-extrabold tracking-[-.04em] text-[#d99b10] sm:text-[44px]">
            Most listened this week
          </span>
          <div className="mt-4 max-w-[620px] text-[16px] leading-[1.6] text-[rgba(233,230,223,.72)]">
            The records that kept pulling you back this week — your five most-played.
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {MOST_LISTENED.map((m) => (
            <div
              key={m.title}
              className="flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-[#d99b10]"
            >
              <div className="aspect-square">
                <ImagePlaceholder label="Cover" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="text-[20px] leading-[.98] font-extrabold tracking-[-.02em]">
                  {m.title}
                </div>
                <div className="mt-1.5 text-[12px] font-semibold text-[rgba(233,230,223,.62)]">
                  {m.artist}
                </div>
                <div className="mt-auto flex items-baseline gap-3.5 pt-3.5">
                  <div>
                    <div className="text-[22px] font-extrabold tracking-[-.02em] text-[#d99b10]">
                      {m.listeners}
                    </div>
                    <div className="mt-1 font-[family-name:var(--font-dm-mono)] text-[9px] font-medium text-[rgba(233,230,223,.5)]">
                      LISTENED
                    </div>
                  </div>
                  <div>
                    <div className="text-[22px] font-extrabold tracking-[-.02em]">{m.plays}</div>
                    <div className="mt-1 font-[family-name:var(--font-dm-mono)] text-[9px] font-medium text-[rgba(233,230,223,.5)]">
                      THIS WEEK
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent reviews */}
      <div className="mt-14 border-t-4 border-double border-[#1c1b18] pt-9">
        <div className="border-b-[2.5px] border-[#d99b10] pb-5">
          <span className="text-[36px] leading-[.98] font-extrabold tracking-[-.04em] text-[#d99b10] sm:text-[44px]">
            Recent JazzLogs reviews
          </span>
          <div className="mt-4 max-w-[620px] text-[16px] leading-[1.6] text-[rgba(233,230,223,.72)]">
            The latest write-ups filed by the desk — records rated, argued for, and set down in
            full.
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MOCK_REVIEWS.slice(0, 3).map((r) => (
            <div
              key={r.title}
              className="flex min-h-[220px] flex-col justify-between rounded-2xl border-[1.5px] border-[#d99b10] p-5.5"
            >
              <div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[22px] leading-[1.02] font-extrabold tracking-[-.02em]">
                      {r.title}
                    </div>
                    <div className="mt-1.5 text-[12px] font-semibold text-[rgba(233,230,223,.6)]">
                      {r.artist}
                    </div>
                  </div>
                  <AverageStars value={r.stars} size={14} />
                </div>
                <div className="mt-3.5 text-[14px] leading-[1.55] text-[rgba(233,230,223,.78)]">
                  &ldquo;{r.body}&rdquo;
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between font-[family-name:var(--font-dm-mono)] text-[10px] font-medium text-[rgba(233,230,223,.5)]">
                <span>{r.date}</span>
                <LikeButton initialCount={r.likes} variant="inline" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
