export const VOCAL_PROFILES = ["INSTRUMENTAL", "VOCAL"] as const;
export type VocalProfile = (typeof VOCAL_PROFILES)[number];

export const LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type Level = (typeof LEVELS)[number];

export const EDITORIAL_BLOCK_TYPES = ["LEAD", "PARA", "QUOTE"] as const;
export type EditorialBlockType = (typeof EDITORIAL_BLOCK_TYPES)[number];

export const TEMPO_FEELS = [
  "BALLAD",
  "SLOW",
  "MEDIUM",
  "UP_TEMPO",
  "BURNING",
] as const;
export type TempoFeel = (typeof TEMPO_FEELS)[number];

export const COMPOSITION_TYPES = [
  "ORIGINAL",
  "STANDARD",
  "COVER",
  "CONTRAFACT",
  "TRADITIONAL",
] as const;
export type CompositionType = (typeof COMPOSITION_TYPES)[number];

export const BLOCK_CONTENT_CATEGORIES = [
  "HOOK",
  "CONTEXT",
  "MUSICAL_ANALYSIS",
  "PERSONNEL_HIGHLIGHT",
  "MOOD_AND_ATMOSPHERE",
  "RECOMMENDATION",
  "QUOTE",
] as const;
export type BlockContentCategory = (typeof BLOCK_CONTENT_CATEGORIES)[number];

export interface VocabularyOption {
  code: string;
  label: string;
}

function codeToLabel(code: string): string {
  return code
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function toOptions(codes: readonly string[]): VocabularyOption[] {
  return codes.map((code) => ({ code, label: codeToLabel(code) }));
}

const STYLE_CODES = [
  "RAGTIME",
  "NEW_ORLEANS_JAZZ",
  "DIXIELAND",
  "SWING",
  "BIG_BAND",
  "GYPSY_JAZZ",
  "BEBOP",
  "HARD_BOP",
  "COOL_JAZZ",
  "WEST_COAST_JAZZ",
  "POST_BOP",
  "MODAL_JAZZ",
  "JAZZ_BLUES",
  "SOUL_JAZZ",
  "JAZZ_FUNK",
  "ACID_JAZZ",
  "FREE_JAZZ",
  "AVANT_GARDE_JAZZ",
  "SPIRITUAL_JAZZ",
  "THIRD_STREAM",
  "JAZZ_FUSION",
  "SMOOTH_JAZZ",
  "CONTEMPORARY_JAZZ",
  "NU_JAZZ",
  "CHAMBER_JAZZ",
  "LATIN_JAZZ",
  "AFRO_CUBAN_JAZZ",
  "BOSSA_NOVA",
  "AFROBEAT",
  "ETHIO_JAZZ",
  "J_JAZZ",
  "VOCAL_JAZZ",
] as const;

const MOOD_CODES = [
  "ENERGETIC",
  "FIERY",
  "JOYFUL",
  "PLAYFUL",
  "TRIUMPHANT",
  "EXUBERANT",
  "UPLIFTING",
  "CONFIDENT",
  "FRENETIC",
  "CHAOTIC",
  "URGENT",
  "TENSE",
  "REBELLIOUS",
  "MENACING",
  "WARM",
  "RELAXED",
  "COOL",
  "ROMANTIC",
  "SOOTHING",
  "INTIMATE",
  "SENSUAL",
  "DREAMY",
  "MELANCHOLIC",
  "LATE_NIGHT",
  "SOMBER",
  "LONELY",
  "WISTFUL",
  "BROODING",
  "NOIR",
  "INTROSPECTIVE",
  "MYSTERIOUS",
  "SPIRITUAL",
  "ETHEREAL",
  "SOULFUL",
  "HYPNOTIC",
  "CEREBRAL",
  "ELEGANT",
  "SMOOTH",
  "GROOVY",
  "GRITTY",
  "SPACIOUS",
  "BLUESY",
] as const;

const CONTEXT_CODES = [
  "DEEP_FOCUS",
  "CREATIVE_WORK",
  "BACKGROUND_AMBIENCE",
  "CAFE_AMBIENCE",
  "READING_A_BOOK",
  "LATE_NIGHT_STUDY",
  "DINNER_PARTY",
  "COCKTAIL_HOUR",
  "INTIMATE_DATE",
  "CASUAL_HANG",
  "SPEAKEASY_VIBE",
  "ELEGANT_GATHERING",
  "GAMING_AND_RPGS",
  "LATE_NIGHT_WHISKEY",
  "LATE_NIGHT_SMOKE",
  "AFTER_HOURS",
  "RAINY_DAY",
  "WINTER_FIREPLACE",
  "AUTUMN_AFTERNOON",
  "SUMMER_NIGHT",
  "BEACH_AND_SUN",
  "GOLDEN_HOUR",
  "SUNRISE",
  "MIDNIGHT_CITY",
  "CABIN_IN_THE_WOODS",
  "LAZY_SUNDAY",
  "UNWINDING",
  "SOLITARY_REFLECTION",
  "BEDTIME",
  "BATH_AND_UNWIND",
  "MORNING_COFFEE",
  "COOKING_DINNER",
  "SOLO_COOKING",
  "HOUSE_CHORES",
  "WAKING_UP",
  "GETTING_READY",
  "WORKOUT_AND_CARDIO",
  "MORNING_COMMUTE",
  "LATE_COMMUTE",
  "LATE_NIGHT_DRIVE",
  "URBAN_NIGHT_WALK",
  "TRAIN_JOURNEY",
  "AIRPLANE_FLIGHT",
  "SCENIC_WALK",
  "ACTIVE_LISTENING",
  "VINYL_SESSION",
  "STUDYING_THE_GREATS",
  "WRITING_JOURNAL",
  "DATE_NIGHT_AT_HOME",
  "NIGHT_OUT_JAZZ_CLUB",
] as const;

// Track-only tag vocabularies (albums don't have rhythm/instrument tags).
const RHYTHM_CODES = [
  "MEDIUM_SWING",
  "UP_TEMPO_SWING",
  "SLOW_SWING",
  "TWO_FEEL",
  "SHUFFLE",
  "JAZZ_WALTZ",
  "GYPSY_SWING",
  "STRAIGHT_EIGHTH",
  "FUNK_GROOVE",
  "SOUL_JAZZ_BOOGALOO",
  "ROCK_BEAT",
  "HIP_HOP_BEAT",
  "NEO_SOUL_GROOVE",
  "DRUM_AND_BASS",
  "BOSSA_NOVA",
  "SAMBA",
  "AFRO_CUBAN",
  "AFRO_CUBAN_6_8",
  "MAMBO",
  "CHA_CHA_CHA",
  "BOLERO",
  "CALYPSO",
  "TANGO",
  "FLAMENCO",
  "AFROBEAT",
  "RUBATO",
  "FREE_TIME",
  "ODD_METER",
  "VAMP",
  "SECOND_LINE",
  "GOSPEL_TRIPLET",
] as const;

const INSTRUMENT_CODES = [
  "ALTO_SAXOPHONE",
  "TENOR_SAXOPHONE",
  "SOPRANO_SAXOPHONE",
  "BARITONE_SAXOPHONE",
  "TRUMPET",
  "CORNET",
  "TROMBONE",
  "FLUGELHORN",
  "FRENCH_HORN",
  "TUBA",
  "CLARINET",
  "FLUTE",
  "BASS_CLARINET",
  "OBOE",
  "PIANO",
  "ELECTRIC_PIANO",
  "ORGAN",
  "SYNTHESIZER",
  "DOUBLE_BASS",
  "ELECTRIC_BASS",
  "GUITAR",
  "ELECTRIC_GUITAR",
  "VIOLIN",
  "CELLO",
  "HARP",
  "BANJO",
  "DRUMS",
  "PERCUSSION",
  "VIBRAPHONE",
  "MARIMBA",
  "CONGAS",
  "BONGOS",
  "VOCALS",
  "HARMONICA",
  "ACCORDION",
] as const;

export const STYLE_OPTIONS = toOptions(STYLE_CODES);
export const MOOD_OPTIONS = toOptions(MOOD_CODES);
export const CONTEXT_OPTIONS = toOptions(CONTEXT_CODES);
export const RHYTHM_OPTIONS = toOptions(RHYTHM_CODES);
export const INSTRUMENT_OPTIONS = toOptions(INSTRUMENT_CODES);
export const BLOCK_CONTENT_CATEGORY_OPTIONS = toOptions(
  BLOCK_CONTENT_CATEGORIES,
);
