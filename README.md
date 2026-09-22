# UBC Science Path

Unofficial student-made companion for **first-year UBC Vancouver B.Sc. Science** students.

First year in UBC Science is undeclared. You do not pick a major on day one. You take a mix of courses, protect a Winter Session average, then apply for a specialization in the spring. This site is built for that stretch of the degree: **what to take**, **what your average actually is**, and **how that average sits against published past cutoffs**.

It is **not affiliated with the University of British Columbia** or the Faculty of Science. It does not make admission decisions. Course lists, eligibility rules, and cutoff numbers follow public Faculty of Science and Calendar pages for the **2026 specialization cycle** and can change. Always confirm with the [Faculty of Science](https://science.ubc.ca/students/spec-admission-requirements), the [UBC Calendar](https://vancouver.calendar.ubc.ca/faculties-colleges-and-schools/faculty-science/bachelor-science), Workday, and advising before you register or apply.

---

## What the site does

Three tools sit on one local site. They share a winter-session average in this browser, but they do not talk to UBC systems.

| Tool | Route | What it is for |
| --- | --- | --- |
| **Course planner** | `/planner` and `/planner/[major]` | Pick a specialization, see first-year Calendar groups (including “or” options), drag courses into Term 1 and Term 2, mark AP credit, and browse Arts / Science breadth / lab extras. |
| **Grade calculator** | `/calculator` | Split courses into Term 1 and Term 2, enter component weights and scores, and get a **credit-weighted percent**. That percent is what Science uses for specialization ranking, not GPA. |
| **Major outlook** | `/outlook` | Compare that winter percent with published 2022–2026 cutoffs and a simple next-year trend. Result is **Low**, **Medium**, or **High**. |

There is no account, no database, and no server-side student record. Marks, timetables, AP chips, and the saved average live in **this browser’s `localStorage`**.

---

## Home page (`/`)

The home page is a guide to first-year Science, then a jump into the three tools.

**Hero.** States that first year is undeclared and second year is a specialization. Links jump to the planner, calculator, and outlook sections on the same page.

**What first year is actually for.** Explains that you register as a B.Sc. student, then spend Winter Session doing two jobs at once: earning credits toward second-year standing, and finishing a shorter eligibility list for the majors you might rank. Placement uses **most recent Winter Session percentage**, not a 4.0 GPA.

**A practical first-year Science plan.** Three steps:

1. **Term 1 (September–December)** — communication (WRDS 150 or SCIE 113), differential calculus, at least one lab science. CPSC 110 belongs here if Computer Science is on the list.
2. **Term 2 (January–April)** — integral calculus, remaining eligibility (CHEM 123, a second biology or physics course, anything still missing). Calendar “Year 1” lists are longer than eligibility lists.
3. **Specialization application (late May–June)** — after second-year standing, rank three specializations. Summer courses usually do not count for that round.

**Tool 1 · Course planner.** Explains working backward from a major you might declare. Shortcut cards open Computer Science, Neuroscience, Biology, Chemistry, Physics, Data Science, Mathematics, and Microbiology and Immunology. Path notes cover life-science, CS-umbrella (at most two CS ranks), and physics-family eligibility.

**Tool 2 · Grade calculator.** Explains credit-weighted winter percent, leftover blank work, and that the average carries into outlook in this browser.

**Tool 3 · Major outlook.** Explains Low / Medium / High from published 2022–2026 cutoffs plus a possible next-year line from that same past trend. The site assumes required courses are already done.

---

## Shared site chrome

These pieces wrap every page.

**Header.** Brand link plus Home, Grade calculator, Course planner, Major outlook. The bar color follows the page: navy on home, gold on planner, green on calculator, red on outlook. A wavy edge matches that color.

**Side rails.** Animated “UBC” beads on the left and right. They are decoration only.

**Footer.** Repeats that the site is unofficial and that lists and cutoffs can change. Links to Faculty of Science specialization admission requirements.

**Page colors.** Planner pages use gold (`#f2d45c`). Calculator uses green (`#c5e8c4`). Outlook uses red (`#c62828`).

Nothing in the chrome logs you in or talks to Workday.

---

## Course planner

### Pick a major (`/planner`)

Lists Faculty of Science specializations the site covers. Search by name. Cards are grouped:

- **Computing** — Computer Science and CS combined majors. You may rank at most two CS-umbrella choices.
- **Math, stats, and data** — Mathematics, Statistics, Data Science, Statistics and Economics.
- **Life science and health** — Biology, Microbiology and Immunology, Pharmacology, CAPS, Biochemistry, Chemical Biology.
- **Brain and behaviour** — Neuroscience, Cognitive Systems (Cognition and Brain).
- **Chemistry** — Chemistry, Biochemistry and Chemistry.
- **Physics and space** — Physics, Astronomy, Atmospheric Science, Geophysics.
- **Earth, environment, and geography** — Earth and Ocean Sciences, Geology, Geographical Sciences, Environmental Sciences.
- **Broad Science degrees** — Integrated Sciences, Combined Major in Science.

Each card shows the specialization name, whether it is a major or combined major, and **limited seats** vs **open seats** (quota). Opening a card goes to that major’s first-year page.

### Major first-year page (`/planner/[id]`)

One page per specialization. It is not a four-year map. It is year one: Calendar groups at the top, a winter timetable at the bottom.

**What to take.** Numbered Calendar groups for that major, including “or” choices (for example MATH 100 / 110 / 120 / 180). Communication (WRDS 150 / SCIE 113 and the official writing-course list) is called out as its own block. **Science One (SCIE 001)** is noted when it already covers eligibility.

**Official Calendar.** Button to the Calendar page for that specialization.

**Yellow stickers.** Latest overall winter class average from [UBC Grades](https://ubcgrades.com/) for that course. These are campus class averages, **not admission cutoffs**.

**AP credit (score 4+).** Chips for exams that grant first-year UBC credit relevant to courses on the page, including:

- AP Calculus AB → MATH 100
- AP Calculus BC → MATH 100 and MATH 101
- AP Chemistry → CHEM 121 (not CHEM 123)
- AP Biology → BIOL 111 / 121 (does not skip BIOL 112)
- AP Physics 2 → PHYS 131 (AP Physics 1 grants no UBC credit)
- AP Physics C: Mechanics → PHYS 117
- AP Physics C: E&M → PHYS 118 (lab still required if the major wants a lab)
- AP Statistics → STAT 200 (does not skip DSCI 100)
- AP Microeconomics / Macroeconomics → ECON 101 / 102
- AP Computer Science A → first-year CPSC credit only; it does **not** skip CPSC 110 or CPSC 107

Toggling an exam marks matching courses as already done. They turn green with an AP label, count toward the progress bar, and are pulled out of Term 1 / Term 2 because they do not need a seat.

**Progress bar.** Percent of required Calendar *groups* that are either placed in a term or covered by AP. In an “or” group you only need one option.

**Still to place.** Leftover required courses, grouped the same way the Calendar lists them. Drag a course onto Term 1 or Term 2, or tap the Term buttons.

**Term 1 and Term 2 boxes.** Your winter timetable. Credits are summed per term. Five courses is treated as a full Science load. A **sixth course pops a warning** — you can keep it, but the site tells you to email Science Advising before you try to register.

**Graduation extras (not a first-year rush).** Optional boxes you can open if you want to chip away at B.Sc. rules this winter. None of these are required to fill first year:

- **Arts credits** — courses that can count toward the B.Sc. 12-credit Arts Requirement (Faculty of Arts offerings, with Calendar exceptions: GEOG yes, GEOS/GEOB no; PSYC 101/102 yes, science-numbered PSYC no; ENGL/WRDS used for Communication do not count twice; music limited to history / theory / ethnomusicology / composition). Sorted by latest winter average. Top 5 and category filters.
- **Science breadth** — first-year Science courses that open a breadth area without another UBC course first.
- **Lab requirement** — Faculty list of courses that can satisfy the B.Sc. lab rule.

You can add a browsed course to Term 1 or Term 2 from those pickers.

**Co-op box.** Optional. Timing and extra first-year courses depend on the Science Co-op discipline (for example Computer Science can apply in Term 2 of first year if CPSC 110 is done and CPSC 121 / 210 are in progress). Co-op admission is separate from getting into the major. Links go to official Science Co-op deadline and requirement pages.

**Optional electives.** Walk-in suggestions to fill an empty seat — high winter averages, no university course first. Co-op prep stays on this list when the major has a first-year Co-op deadline. The copy tells you to skip anything that would drag the average down.

**Heads up / small print.** Specialization-specific notes (CS umbrella quota, honours floors, MATH course-average rules, and similar).

**Check outlook.** Opens `/outlook?major=…` for that specialization.

Timetables are saved **per major** in this browser (`usp.termplan`). AP chips are saved once (`usp.ap`) and reused on other major pages.

**How this works.** A gold spotlight tour walks through Calendar list, AP, leftover bench, term boxes, extras, Co-op, and electives.

---

## Grade calculator (`/calculator`)

Built to match how Science actually ranks: **credit-weighted percent across Term 1 and Term 2**, not GPA.

### Three average boxes

- **Term 1 average** — September–December courses.
- **Term 2 average** — January–April courses.
- **Combined / winter-session average** — credit-weighted percent across both. This is the number Science uses for specialization ranking.

Each box shows:

- The current percent, or a dash if there are no scores yet
- Letter grade and 4.33-scale GPA for that percent
- How far you are **above or below a target score** if you set one
- Each course’s percent and the gap to **that box’s** average (so the “% behind” a course is vs the term or winter average, not a mystery leftover)
- Credits currently counting

**Targets.** Each box has its own target %. Term 1, Term 2, and winter are independent. If Term 1 is in and you set a winter target, a hint tells you what Term 2 still has to be (and the other way around). If some courses in the box still have no scores, the leftover-work hint says what those remaining credits need to average to hit the target.

A **NOW** badge marks the term the calendar clock thinks you are in (Term 1 vs Term 2).

### Courses

- **Add Term 1 course** / **Add Term 2 course.**
- **Search by course code.** Type `MATH 100` or `CPSC 110`. The list is 100- and 200-level Science so the catalog stays small (200s are included in case AP already covered a 100).
- **Credits.** Used as the weight in the sessional average. A 4-credit lab science pulls harder than a 1-credit lab.
- **Term chips.** Move a course between Term 1 and Term 2 if the timetable changes.
- **Per-course target %.** Separate from the term/winter targets.
- **Delete course.**

Default components on a new course are Assignments (20), Midterm (30), Final (50). You can change those.

### Components (weights and scores)

Each course is a list of syllabus slices:

- **Name** — Assignments, Midterm, Final, Attendance, Lab, or a name you create (Quiz, Project, …). Names you create stay in the list so you can pick them again on another course.
- **Weight** — the syllabus percent for that slice. Clear the box to type `20`, not `020`.
- **Score** — what you got. Leave it blank if the work is not done yet. Blank scores are leftover work; they do not count as zeros.

The course percent is the **weight-normalized** average of scored components only. Unscored weight is ignored until you enter a mark.

If a **score**, **weight**, **sum of weights**, or **term/winter average** goes over 100%, a notice frame lists what overflowed so you can fix it.

### Deep analysis

Each average box has **Deep analysis**. It opens a panel for that box (Term 1, Term 2, or combined):

- Courses ranked by your current percent
- Latest campus winter overall from UBC Grades for each course, plus recent winter history
- Line graph of **you vs campus vs this box’s target**, with the actual percent gap to the latest campus winter average
- Component averages grouped by name (including custom names like Quiz), so you can see how you are doing on midterms across courses

Campus numbers are class averages, not cutoffs.

### What gets saved

- Courses, targets, and custom component names → `usp.calculator`
- Combined winter percent → `usp.sessional` (Major Outlook reads this)

Nothing is uploaded.

**How this works.** A green spotlight tour walks through the three averages, deep analysis, course search, components, and term chips.

---

## Major outlook (`/outlook`)

Local planning read of **published past cutoffs**. It is not a UBC decision and not a probability.

### Inputs

- **Target specialization** — every specialization the planner covers. Opens on `?major=` from a planner page, or the first intended major in planner storage, or Computer Science.
- **Winter Session average (%)** — prefilled from the calculator’s combined average when it exists. You can type another percent. Clearing the box leaves it **empty** (it does not snap back to `0`). Leading zeros are stripped (`020` becomes `20`). Placement uses percent, not GPA; a GPA line is shown only as a translation.

Outlook **assumes you already took the required courses**. There is no Blocked / missing-eligibility result.

### Chance word

One of:

- **Low** — below most recent published cutoffs, and usually below the next-year trend line as well
- **Medium** — mixed against past years, or close to the latest line / trend
- **High** — above recent published years (or the program has no quota, or recent years were unfilled / NF)

Honours paths that list a published winter-session floor read **Low** if your average is under that floor.

### Graph

**You vs published cutoffs.**

- Black points and line — published winter-session cutoffs year by year
- Dashed green line — your winter average
- Green / red stems — how far you would have been above or below that year
- Gold dashed point — a **possible next-year cutoff** from a simple trend through the last published numeric years (clamped so it cannot jump more than 6 points from the latest published number)
- For Computer Science through 2024, each point is the **average of the domestic and international lines**. From 2025 there is one combined cutoff. The graph marks that change.

The vertical axis is zoomed around the numbers so a 2–4 point gap is visible. The line breaks on NF or suppressed years.

**Official cutoffs** button opens the Faculty of Science historical B.Sc. specialization admission page.

### Explanation

One short paragraph, not a long list:

- Assumes required courses are already done
- How your percent sits against published years (this sentence is bold)
- How the past line has been moving, and where a possible next year sits
- Bold reminder: **this is only based on past published cutoffs — not a UBC decision**

The year-by-year evidence lives on the graph. Beating last year or a trend line does not guarantee this year.

---

## How the three tools connect

```
Planner (courses + AP + timetable)
        │
        │  intended major (optional)
        ▼
Outlook  ◄──── winter % ────  Calculator (Term 1 + Term 2 marks)
```

- Calculator writes `usp.sessional` whenever a combined percent exists.
- Outlook reads that number on load. Editing the outlook box does not overwrite the calculator.
- Planner can deep-link outlook with `?major=cpsc` (or any specialization id).
- Planner completed-course lists are **not** used to block outlook. Outlook always assumes eligibility courses are done.

---

## What is stored in this browser

| Key | Contents |
| --- | --- |
| `usp.calculator` | Courses, term, credits, components, course targets, term/winter targets, custom component names |
| `usp.sessional` | Combined winter percent from the calculator |
| `usp.planner` | Intended majors and any completed-course flags used elsewhere in the planner |
| `usp.termplan` | Term 1 / Term 2 course codes, keyed by specialization id |
| `usp.ap` | Selected AP exams |

Clearing site data for this origin wipes all of that. Another browser or device starts empty.

---

## Data the site uses

- **Specialization eligibility and notes** — Faculty of Science B.Sc. Specialization Application Requirements (2026 cycle), stored in `src/lib/specializations.ts`.
- **First-year Calendar groups** — UBC Vancouver Calendar “Year 1” lists, including official Calendar URLs on each major page.
- **Historical cutoffs (2022–2026)** — [Historical BSc Specialization Admission Information](https://science.ubc.ca/students/historical-bsc-specialization-admission-information). NF = not filled. `sup` = suppressed. Computer Science 2022–2024 points are the mean of published DOM and INT lines.
- **Campus winter class averages** — [UBC Grades](https://ubcgrades.com/) via `/api/winter-averages`. Cached about a day on major pages.
- **AP first-year credit** — you.ubc.ca first-year credit tables (score 4+).
- **B.Sc. Arts / breadth / lab rules** — Calendar Science and Arts Requirements, Science Breadth Requirement, and Lower-level Requirements.
- **Co-op timing** — sciencecoop.ubc.ca application requirements and deadline table, plus Calendar notes for Computer Science Co-op.

If those pages change, this site can be wrong until someone updates the data files.

---

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js 16 dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

Stack: Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript. No database.

---

## What this site will not do

- It will not register you, apply for you, or talk to Workday.
- It will not give an official admission chance or a probability percent.
- It will not replace the Calendar, Science Advising, or the Faculty of Science cutoff page.
- It does not use official UBC crests or claim affiliation.

Use it to plan. Confirm before you act.
