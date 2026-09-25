// Static mock data standing in for the backend catalogue. Swap each array
// for a real fetch once the corresponding API endpoint exists — the shape
// here is deliberately close to what /albums, /tracks etc. will return.

export interface MockAlbum {
  id: string;
  title: string;
  artist: string;
  label: string;
  year: string;
  tracks: number;
}

export const MOCK_ALBUMS: MockAlbum[] = [
  { id: "kind-of-blue", title: "Kind of Blue", artist: "Miles Davis", label: "COLUMBIA", year: "1959", tracks: 5 },
  { id: "a-love-supreme", title: "A Love Supreme", artist: "John Coltrane", label: "IMPULSE!", year: "1965", tracks: 4 },
  { id: "speak-no-evil", title: "Speak No Evil", artist: "Wayne Shorter", label: "BLUE NOTE", year: "1966", tracks: 6 },
  { id: "maiden-voyage", title: "Maiden Voyage", artist: "Herbie Hancock", label: "BLUE NOTE", year: "1965", tracks: 5 },
  { id: "mingus-ah-um", title: "Mingus Ah Um", artist: "Charles Mingus", label: "COLUMBIA", year: "1959", tracks: 9 },
  { id: "time-out", title: "Time Out", artist: "Dave Brubeck", label: "COLUMBIA", year: "1959", tracks: 7 },
  { id: "blue-train", title: "Blue Train", artist: "John Coltrane", label: "BLUE NOTE", year: "1958", tracks: 5 },
  { id: "moanin", title: "Moanin’", artist: "Art Blakey", label: "BLUE NOTE", year: "1958", tracks: 6 },
  { id: "waltz-for-debby", title: "Waltz for Debby", artist: "Bill Evans", label: "RIVERSIDE", year: "1961", tracks: 8 },
];

export interface MockTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: string;
  duration: string;
}

export const MOCK_TRACKS: MockTrack[] = [
  { id: "naima", title: "Naima", artist: "John Coltrane", album: "Giant Steps", year: "1960", duration: "4:21" },
  { id: "so-what", title: "So What", artist: "Miles Davis", album: "Kind of Blue", year: "1959", duration: "9:22" },
  { id: "peace-piece", title: "Peace Piece", artist: "Bill Evans", album: "Everybody Digs Bill Evans", year: "1958", duration: "6:41" },
  { id: "round-midnight", title: "’Round Midnight", artist: "Thelonious Monk", album: "Monk’s Music", year: "1957", duration: "5:52" },
  { id: "my-funny-valentine", title: "My Funny Valentine", artist: "Chet Baker", album: "Chet Baker Sings", year: "1954", duration: "2:22" },
  { id: "moanin-track", title: "Moanin’", artist: "Art Blakey", album: "Moanin’", year: "1958", duration: "9:35" },
  { id: "st-thomas", title: "St. Thomas", artist: "Sonny Rollins", album: "Saxophone Colossus", year: "1956", duration: "6:45" },
  { id: "take-five", title: "Take Five", artist: "Dave Brubeck", album: "Time Out", year: "1959", duration: "5:24" },
];

export interface MockPlaylist {
  id: string;
  title: string;
  note: string;
  tag: string;
  count: number;
  likes: number;
}

export const MOCK_PLAYLISTS: MockPlaylist[] = [
  { id: "rainy-day-ballads", title: "Rainy-day ballads", note: "The slow ones we reach for when the light goes grey.", tag: "MOOD", count: 24, likes: 218 },
  { id: "late-night-piano", title: "Late-night piano", note: "Evans, Jarrett, and the art of the trio at 2am.", tag: "MOOD", count: 18, likes: 156 },
  { id: "first-listen-jazz", title: "First-listen jazz", note: "The gateway records, in the order we'd hand them to a friend.", tag: "STARTER", count: 15, likes: 342 },
  { id: "muted-trumpet", title: "The muted trumpet", note: "Miles, Chet and the sound of restraint.", tag: "INSTRUMENT", count: 16, likes: 129 },
  { id: "blue-note-1963-65", title: "Blue Note, 1963–65", note: "The label at its sharpest — hard bop growing shadows.", tag: "ERA", count: 22, likes: 174 },
  { id: "up-and-swinging", title: "Up & swinging", note: "For the mornings that need momentum.", tag: "TEMPO", count: 20, likes: 191 },
];

export interface MockSeries {
  id: string;
  title: string;
  note: string;
  tag: string;
  chapters: number;
  duration: string;
}

export const MOCK_SERIES: MockSeries[] = [
  { id: "blue-note-1959", title: "Blue Note, 1959", note: "The year the label found its sound, in six chapters.", tag: "ERA", chapters: 6, duration: "58 min" },
  { id: "birth-of-cool", title: "The birth of cool", note: "How Miles and Gil Evans cooled jazz down.", tag: "ERA", chapters: 5, duration: "41 min" },
  { id: "piano-trios", title: "Piano trios after midnight", note: "Evans, Jarrett, and the art of three.", tag: "MOOD", chapters: 4, duration: "33 min" },
  { id: "coltrane-step-by-step", title: "Coltrane, step by step", note: "From sideman to A Love Supreme, one record at a time.", tag: "ARTIST", chapters: 7, duration: "1h 04m" },
  { id: "first-hour", title: "A first hour of jazz", note: "Never listened before? Start exactly here.", tag: "STARTER", chapters: 5, duration: "46 min" },
];

export interface MockNote {
  ts: string;
  album: string;
  track: string;
  title: string;
  text: string;
  date: string;
  likes: number;
}

export const MOCK_NOTES: MockNote[] = [
  { ts: "4:10", album: "KIND OF BLUE", track: "SO WHAT", title: "Weightless", text: "The whole band floating an inch off the ground. I never want it to land — it just keeps hanging there.", date: "JUL 9", likes: 6 },
  { ts: "2:40", album: "KIND OF BLUE", track: "BLUE IN GREEN", title: "Barely there", text: "Evans and Miles saying everything by playing almost nothing. The silences carry as much as the notes.", date: "JUL 9", likes: 9 },
  { ts: "0:52", album: "A LOVE SUPREME", track: "ACKNOWLEDGEMENT", title: "The chant", text: "It arrives like it was always there and you only just noticed. Goosebumps every single time.", date: "JUL 2", likes: 12 },
  { ts: "3:10", album: "WALTZ FOR DEBBY", track: "MY FOOLISH HEART", title: "Glass clink", text: "You can hear the room. Someone sets down a glass behind the trio and it never breaks the spell.", date: "JUN 21", likes: 4 },
  { ts: "4:05", album: "SAXOPHONE COLOSSUS", track: "BLUE 7", title: "The argument", text: "Rollins building a whole thesis from one motif. A solo that actually reasons its way somewhere.", date: "JUN 10", likes: 7 },
  { ts: "2:12", album: "MINGUS AH UM", track: "GOODBYE PORK PIE HAT", title: "Remembering", text: "The saxophone sounds like it is remembering someone rather than playing for them. Unbearably tender.", date: "MAY 14", likes: 11 },
];
