import {
  BREADTH_CATEGORIES,
  LAB_COURSES,
  breadthLabel,
  countsAsBscArtsCredit,
  type BreadthId,
} from "./degree-requirements";
import type { CatalogCourse } from "./types";

/**
 * First-year courses a Science student can walk into for Arts credit, Science
 * breadth, or the lab list. University-course prerequisites are the filter —
 * high-school Physics 12 / Chemistry 12 still apply where the Calendar says so.
 */

export type BrowseKind = "arts" | "breadth" | "lab";

export type BrowseCourse = {
  code: string;
  title: string;
  credits: number;
  category: string;
  note?: string;
};

function item(
  category: string,
  code: string,
  title: string,
  credits = 3,
  note?: string,
): BrowseCourse {
  return { code, title, credits, category, note };
}

export const ARTS_CATEGORIES = [
  "Psychology",
  "Economics",
  "Philosophy",
  "Linguistics",
  "Language",
  "Political science",
  "Sociology",
  "Family studies",
  "Anthropology",
  "Archaeology",
  "History",
  "Geography",
  "Ancient Mediterranean",
  "Asian studies",
  "Religion",
  "Gender and social justice",
  "Art history",
  "Cinema",
  "Creative writing",
  "Visual arts",
  "Theatre",
  "Music",
  "Indigenous studies",
  "Journalism",
  "Information studies",
  "Canadian studies",
  "Latin American studies",
  "African studies",
  "Urban studies",
  "Law and society",
  "Medieval studies",
  "European studies",
  "Social work",
] as const;

/**
 * Faculty of Arts walk-ins that count toward the B.Sc. 12-credit Arts
 * Requirement (Calendar: courses offered by Arts, not GEOS/GEOB, not
 * science-numbered PSYC, not Communication). Music is only history / theory /
 * ethnomusicology / composition. Language courses in Arts departments count.
 */
export const ARTS_BROWSE: BrowseCourse[] = [
  item("Psychology", "PSYC 101", "Introduction to Biological and Cognitive Psychology", 3, "Arts credit — not science PSYC."),
  item("Psychology", "PSYC 102", "Introduction to Developmental, Social, Personality, and Clinical Psychology", 3, "Arts credit — not science PSYC."),
  item("Economics", "ECON 101", "Principles of Microeconomics"),
  item("Economics", "ECON 102", "Principles of Macroeconomics"),
  item("Philosophy", "PHIL 101", "Introduction to Philosophy"),
  item("Philosophy", "PHIL 102", "Introduction to Philosophy II"),
  item("Philosophy", "PHIL 104", "Happiness"),
  item(
    "Philosophy",
    "PHIL 120",
    "Introduction to Critical Thinking",
    3,
    "Restricted to students under 90 credits.",
  ),
  item(
    "Philosophy",
    "PHIL 125",
    "Introduction to Scientific Reasoning",
    3,
    "Restricted to students under 90 credits.",
  ),
  item("Philosophy", "PHIL 220", "Symbolic Logic"),
  item("Linguistics", "LING 100", "Introduction to Language and Linguistics"),
  item("Linguistics", "LING 101", "Languages of the World"),
  item("Linguistics", "LING 170", "Introduction to How to Learn a Language"),
  item(
    "Language",
    "FREN 101",
    "Beginners' French I",
    3,
    "Not for credit if you completed Core French 11, 12, or Immersion.",
  ),
  item("Language", "SPAN 101", "Beginners' Spanish I"),
  item("Language", "GERN 101", "Learning German 1"),
  item("Language", "ITAL 101", "Beginners' Italian I"),
  item("Language", "PORT 101", "Beginners' Portuguese I"),
  item(
    "Language",
    "JAPN 100",
    "Beginning Japanese IA",
    3,
    "Not for credit with Japanese 11 or 12. Placement guidelines apply.",
  ),
  item(
    "Language",
    "KORN 100",
    "Basic Korean I",
    3,
    "Korean Placement Interview before you register.",
  ),
  item(
    "Language",
    "CHIN 131",
    "Basic Chinese I: Part 1 (Non-Heritage)",
    3,
    "For students new to Mandarin. Asian Studies placement rules apply.",
  ),
  item("Language", "RUSS 101", "Learning Russian 1"),
  item("Language", "ASL 100", "American Sign Language and Deaf Culture I"),
  item("Language", "GREK 101", "Beginning Ancient Greek I"),
  item("Language", "LATN 101", "Beginning Latin I"),
  item("Language", "HEBR 101", "Beginning Hebrew I"),
  item("Language", "HINU 102", "Introductory Hindi-Urdu I"),
  item("Language", "PUNJ 102", "Introductory Punjabi I"),
  item("Language", "PERS 100", "Basic Persian I"),
  item("Language", "ARBC 101", "Beginning Classical Arabic I"),
  item("Language", "ARBM 101", "Beginning Modern Standard Arabic I"),
  item("Language", "SWAH 101", "Introductory Swahili I"),
  item("Language", "TIBT 100", "Introduction to Tibetan I"),
  item("Language", "DANI 100", "Elementary Danish I"),
  item("Language", "SWED 100", "Elementary Swedish I"),
  item("Language", "UKRN 101", "Basic Ukrainian I"),
  item(
    "Language",
    "FNEL 101",
    "Introduction to a Salish Language I",
    3,
    "No prior knowledge assumed. The specific Salish language varies by offering.",
  ),
  item("Political science", "POLI 100", "Introduction to Politics"),
  item("Political science", "POLI 101", "Introduction to Canadian Politics"),
  item("Political science", "POLI 110", "Investigating Politics: An Introduction to Scientific Political Analysis"),
  item("Sociology", "SOCI 101", "Social Interaction and Culture"),
  item("Sociology", "SOCI 102", "Inequality and Social Change"),
  item("Sociology", "SOCI 200", "Sociology of Family"),
  item("Sociology", "SOCI 204", "Global Population Dynamics"),
  item("Sociology", "SOCI 220", "Sociology of Indigenous Peoples"),
  item("Sociology", "SOCI 224", "Sociology of Personal Life"),
  item("Sociology", "SOCI 230", "Shopping, Society, and Sustainability"),
  item("Family studies", "FMST 210", "Family Context of Human Development"),
  item("Family studies", "FMST 238", "Family Resource Management"),
  item("Anthropology", "ANTH 100", "Introduction to Cultural Anthropology"),
  item("Anthropology", "ANTH 201", "Culture, Race and Inequality"),
  item("Anthropology", "ANTH 202", "Contemporary Social Problems"),
  item("Anthropology", "ANTH 203", "Anthropology of Drugs"),
  item("Anthropology", "ANTH 206", "Witches, Vampires, and Zombies: Anthropology of the Supernatural"),
  item("Anthropology", "ANTH 210", "Eating Culture"),
  item("Anthropology", "ANTH 213", "Sex, Gender, and Culture"),
  item("Anthropology", "ANTH 214", "The Family in Cross-Cultural Perspective"),
  item("Archaeology", "ARCL 103", "Introduction to Archaeology: Past Perspectives and Future Promise"),
  item("Archaeology", "ARCL 140", "Bones: The Origins of Humanity"),
  item("Archaeology", "ARCL 203", "Archaeological Methods"),
  item("Archaeology", "ARCL 204", "Great Archaeological Discoveries"),
  item("Archaeology", "ARCL 228", "Forensic Anthropology"),
  item("History", "HIST 100", "What is History?"),
  item("History", "HIST 104", "Topics in World History"),
  item("History", "HIST 109", "Cultural Histories of Media: From Writing to Tweeting"),
  item("History", "HIST 112", "Global History from the 15th to 20th Century"),
  item("History", "HIST 113", "Global History Since 1900"),
  item("History", "HIST 201", "History Through Photographs"),
  item("History", "HIST 204", "History Through Video Games"),
  item("Geography", "GEOG 121", "Geography, Environment and Globalization", 3, "GEOG is Arts. GEOS/GEOB is Science and does not count."),
  item("Geography", "GEOG 122", "Geography, Modernity and Globalization", 3, "GEOG is Arts. GEOS/GEOB is Science and does not count."),
  item(
    "Geography",
    "GEOG 250",
    "Cities",
    3,
    "Same as URST 200 — take one, not both.",
  ),
  item("Ancient Mediterranean", "AMNE 101", "Greek and Latin Roots of English"),
  item("Ancient Mediterranean", "AMNE 151", "Greek and Roman Mythology"),
  item(
    "Ancient Mediterranean",
    "AMNE 160",
    "Introduction to Religions: Judaism, Christianity, Islam",
    3,
    "Same as RGST 160 — take one, not both.",
  ),
  item("Ancient Mediterranean", "AMNE 170", "Temples, Tombs, and Tyrants: The Archaeology of the Middle East, Greece, and Rome"),
  item("Ancient Mediterranean", "AMNE 200", "Approaching the Ancient Mediterranean & Near East"),
  item("Ancient Mediterranean", "AMNE 215", "Ancient Greece"),
  item("Ancient Mediterranean", "AMNE 216", "Ancient Rome"),
  item("Ancient Mediterranean", "AMNE 225", "Gladiators, Games, and Spectacle in the Greek and Roman World"),
  item("Ancient Mediterranean", "AMNE 251", "Near Eastern and Biblical Mythology"),
  item("Asian studies", "ASIA 100", "Introduction to Traditional Asia"),
  item("Asian studies", "ASIA 101", "Introduction to Modern Asia"),
  item("Asian studies", "ASIA 110", "Introduction to Religions in Asia"),
  item("Asian studies", "ASIA 210", "Traditions of Yoga"),
  item("Asian studies", "ACAM 100", "Introduction to Asian Canadian Studies"),
  item(
    "Religion",
    "RGST 160",
    "Introduction to Religions: Judaism, Christianity, Islam",
    3,
    "Same as AMNE 160 — take one, not both.",
  ),
  item("Religion", "RGST 200", "Introduction to the Study of Religion"),
  item("Gender and social justice", "GRSJ 101", "Introduction to Social Justice"),
  item("Gender and social justice", "GRSJ 102", "Global Issues in Social Justice"),
  item("Gender and social justice", "CSIS 200", "Introduction to Critical Studies in Gender and Sexuality"),
  item("Art history", "ARTH 101", "Ways of Seeing: Introduction to Visual Studies"),
  item("Art history", "ARTH 102", "World Art and Architecture Before 1800"),
  item("Art history", "ARTH 227", "What is Modern Art?"),
  item("Art history", "ARTH 251", "Asian Arts: From Chinese Warriors to Bollywood Posters"),
  item("Art history", "ARTH 262", "Indigenous Arts of North America"),
  item(
    "Cinema",
    "CINE 100",
    "Introduction to Cinema Studies",
    3,
    "Same as the old FIST 100 code.",
  ),
  item("Cinema", "CINE 200", "Introduction to Canadian Cinema"),
  item(
    "Creative writing",
    "CRWR 200",
    "Introduction to Creative Writing",
    3,
    "Manuscript submission is not required.",
  ),
  item("Creative writing", "CRWR 201", "Introduction to Writing Poetry"),
  item("Creative writing", "CRWR 203", "Introduction to Writing for Children and Young Adults"),
  item("Creative writing", "CRWR 205", "Introduction to Writing Creative Nonfiction"),
  item("Creative writing", "CRWR 206", "Introduction to Writing for the Screen"),
  item("Creative writing", "CRWR 208", "Introduction to Writing for Graphic Forms"),
  item("Creative writing", "CRWR 209", "Introduction to Writing Fiction"),
  item("Creative writing", "CRWR 213", "Introduction to Writing for the New Media"),
  item("Creative writing", "CRWR 220", "Introduction to Creative Writing with an Indigenous Focus"),
  item(
    "Visual arts",
    "VISA 110",
    "Foundation Studio: Digital Media",
    3,
    "Open to all students. Studio course fee applies.",
  ),
  item(
    "Visual arts",
    "VISA 180",
    "Foundation Studio: Approaches to Media",
    3,
    "Open to all students. Studio course fee applies.",
  ),
  item(
    "Visual arts",
    "VISA 183",
    "Foundation Studio: Ideas as Practice I",
    3,
    "Open to all students. Studio course fee applies.",
  ),
  item("Theatre", "THTR 120", "Introduction to Theatre"),
  item("Theatre", "THTR 130", "Introduction to Stage Acting"),
  item("Theatre", "THTR 210", "Drama: Forms and Ideas I"),
  item(
    "Music",
    "MUSC 103",
    "Introduction to the Theory of Music",
    3,
    "Music theory counts as Arts for a B.Sc. No background needed. Not for B.Mus. credit.",
  ),
  item("Music", "MUSC 120", "History of Music I", 3, "Music history counts as Arts for a B.Sc."),
  item(
    "Music",
    "MUSC 128",
    "Music and Human Experience",
    3,
    "World-tradition survey — ethnomusicology, which counts as Arts for a B.Sc.",
  ),
  item("Indigenous studies", "FNIS 100", "Indigenous Foundations"),
  item("Indigenous studies", "FNEL 180", "Introduction to Endangered Language Documentation and Revitalization"),
  item("Journalism", "JRNL 100", "New Media and Society"),
  item("Journalism", "JRNL 200", "Journalism Here and Now"),
  item("Information studies", "INFO 100", "(De)coding Information and Why it Matters"),
  item("Information studies", "INFO 200", "Foundations of Informatics"),
  item("Canadian studies", "CDST 250", "Introduction to Canada"),
  item("Latin American studies", "LAST 100", "Introduction to Latin American Studies"),
  item("African studies", "AFST 250", "Introduction to African Studies"),
  item(
    "Urban studies",
    "URST 200",
    "Cities",
    3,
    "Same as GEOG 250 — take one, not both.",
  ),
  item("Law and society", "LASO 204", "Introduction to Law and Society"),
  item("Medieval studies", "MDVL 210", "Introduction to Medieval Studies"),
  item("European studies", "CENS 201", "Contrasts and Conflicts: The Cultures of Central, Eastern and Northern Europe"),
  item("European studies", "CENS 202", "Great Works of Literature from Central, Eastern and Northern Europe"),
  item("European studies", "CENS 203", "Arctic Art and Activism"),
  item("European studies", "GMST 121", "Fairy Tales and Popular Culture"),
  item("Social work", "SOWK 200", "Introduction to Social Welfare"),
];

for (const course of ARTS_BROWSE) {
  if (!countsAsBscArtsCredit(course.code)) {
    throw new Error(`${course.code} is not a B.Sc. Arts Requirement credit`);
  }
}

/** First-year Science courses that open a breadth area without another UBC course first. */
export const BREADTH_BROWSE: BrowseCourse[] = [
  item("math", "MATH 100", "Differential Calculus"),
  item("math", "MATH 102", "Differential Calculus with Applications to Life Sciences"),
  item("math", "MATH 104", "Differential Calculus with Applications to Commerce and Social Sciences"),
  item("math", "MATH 110", "Differential Calculus (extended)", 6),
  item("math", "MATH 120", "Honours Differential Calculus", 4),
  item("math", "MATH 180", "Differential Calculus with Physical Applications", 4),
  item("math", "MATH 184", "Differential Calculus for Social Sciences and Commerce"),
  item("chem", "CHEM 111", "Structure, Bonding and Equilibrium", 4, "For students without Chemistry 12."),
  item("chem", "CHEM 121", "Structure and Bonding in Chemistry", 4),
  item("chem", "CHEM 141", "Structure and Bonding (enriched)", 4),
  item("phys", "PHYS 117", "Dynamics and Waves"),
  item("phys", "PHYS 131", "Energy and Waves"),
  item("phys", "PHYS 106", "Enriched Physics I"),
  item("phys", "PHYS 107", "Enriched Physics I (alternate)"),
  item("life", "BIOL 111", "Introduction to Modern Biology", 3, "If you already have Biology 12, take BIOL 112."),
  item("life", "BIOL 112", "Biology of the Cell"),
  item("life", "BIOL 121", "Genetics, Evolution and Ecology"),
  item("stat", "DSCI 100", "Introduction to Data Science"),
  item(
    "cpsc",
    "CPSC 100",
    "Computational Thinking",
    3,
    "Not open once you have CPSC 107, CPSC 110, or APSC 160.",
  ),
  item("cpsc", "CPSC 103", "Introduction to Systematic Program Design"),
  item("cpsc", "CPSC 110", "Computation, Programs, and Programming", 4),
  item("earth", "EOSC 110", "The Solid Earth: A Dynamic Planet"),
  item("earth", "EOSC 112", "The Climate System"),
  item("earth", "EOSC 114", "The Catastrophic Earth: Natural Disasters"),
  item("earth", "ATSC 113", "Weather Science for Sailing, Flying, and Snow Sports"),
  item(
    "earth",
    "ASTR 101",
    "Introduction to the Solar System",
    3,
    "Needs Physics 11, Physics 12, or PHYS 100, plus Pre-calculus 12. Also a lab course.",
  ),
];

const LAB_TITLES: Record<string, { title: string; credits: number; note?: string }> = {
  "ASTR 101": {
    title: "Introduction to the Solar System",
    credits: 3,
    note: "Needs Physics 11, Physics 12, or PHYS 100, plus Pre-calculus 12.",
  },
  "ASTR 102": {
    title: "Introduction to Stars and Galaxies",
    credits: 3,
    note: "Needs Physics 11, Physics 12, or PHYS 100, plus Principles of Mathematics 12.",
  },
  "BIOL 140": {
    title: "Laboratory Investigations in Life Science",
    credits: 2,
    note: "Needs Biology 11, Biology 12, or BIOL 111. Does not open Life Science breadth.",
  },
  "CHEM 111": { title: "Structure, Bonding and Equilibrium", credits: 4 },
  "CHEM 115": {
    title: "Introductory Chemical Laboratory I",
    credits: 1,
    note: "Needs CHEM 110 or CHEM 120.",
  },
  "CHEM 121": { title: "Structure and Bonding in Chemistry", credits: 4 },
  "CHEM 123": { title: "Thermodynamics, Kinetics and Organic Chemistry", credits: 4 },
  "CHEM 135": {
    title: "Introductory Chemical Laboratory II",
    credits: 1,
    note: "Pairs with CHEM 130.",
  },
  "EOSC 111": {
    title: "Laboratory Exploration of Planet Earth",
    credits: 1,
    note: "No prerequisite. Does not open Earth & Planetary Science breadth.",
  },
  "PHYS 101": {
    title: "Energy and Waves",
    credits: 3,
    note: "Needs Physics 12 or PHYS 100, and a first-year calculus course as a corequisite.",
  },
  "PHYS 107": { title: "Enriched Physics I (alternate)", credits: 3 },
  "PHYS 109": {
    title: "Enriched Experimental Physics",
    credits: 1,
    note: "Needs PHYS 107. Corequisite PHYS 108 or PHYS 118.",
  },
  "PHYS 119": { title: "Experimental Physics Lab", credits: 1 },
  "PHYS 159": { title: "Introductory Physics Laboratory", credits: 1 },
  "SCIE 001": { title: "Science One", credits: 27, note: "The integrated first-year stream." },
};

export const LAB_BROWSE: BrowseCourse[] = LAB_COURSES.map((code) => {
  const meta = LAB_TITLES[code];
  return item("Lab", code, meta?.title ?? code, meta?.credits ?? 3, meta?.note);
});

const BY_KIND: Record<BrowseKind, BrowseCourse[]> = {
  arts: ARTS_BROWSE,
  breadth: BREADTH_BROWSE,
  lab: LAB_BROWSE,
};

export function browseCourses(kind: BrowseKind): BrowseCourse[] {
  return BY_KIND[kind];
}

export function browseCategories(kind: BrowseKind): string[] {
  if (kind === "arts") return [...ARTS_CATEGORIES];
  if (kind === "lab") return [];
  return BREADTH_CATEGORIES.map((category) => category.id);
}

export function browseCategoryLabel(kind: BrowseKind, category: string): string {
  if (kind === "breadth") return breadthLabel(category as BreadthId);
  return category;
}

export function browseCodes(): string[] {
  return [...new Set([...ARTS_BROWSE, ...BREADTH_BROWSE, ...LAB_BROWSE].map((item) => item.code))];
}

export function sortByWinterAverage(
  courses: BrowseCourse[],
  averages: Record<string, { average: number } | null | undefined>,
): BrowseCourse[] {
  return [...courses].sort((a, b) => {
    const scoreA = averages[a.code]?.average ?? -1;
    const scoreB = averages[b.code]?.average ?? -1;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.code.localeCompare(b.code);
  });
}

export function browseByCode(code: string): CatalogCourse | undefined {
  const hit = [...ARTS_BROWSE, ...BREADTH_BROWSE, ...LAB_BROWSE].find((item) => item.code === code);
  if (!hit) return undefined;
  return {
    code: hit.code,
    title: hit.title,
    credits: hit.credits,
    tags: [],
    blurb: hit.note ?? "",
  };
}

export function artsCreditsOf(code: string): number {
  if (!countsAsBscArtsCredit(code)) return 0;
  return ARTS_BROWSE.find((item) => item.code === code)?.credits ?? 0;
}

