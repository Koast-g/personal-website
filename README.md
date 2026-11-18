# Personal website

Kostiantyn Tsymbal's personal website: about, projects, résumé, research papers and contact. It's built with [Hugo](https://gohugo.io/) out of plain HTML, CSS and a little JavaScript, with an ocean theme: the home page is a dive, and each section sits one ocean zone deeper than the one before.

## Preview it

1. Install Hugo once: `brew install hugo`
2. In this folder, run `hugo server`
3. Open http://localhost:1313/personal-website/

The page reloads by itself whenever you save a file. Press Ctrl+C in the terminal to stop.

## Where things live

| To change | Edit |
| --- | --- |
| The intro at the top, the About text and the quick facts | `content/_index.md` |
| Experience and Activities (plus education, skills, languages, and awards and honors) | `data/experience.yaml` |
| The UniCab write-up | `content/projects/unicab/_index.md` |
| The CSC-324 competencies (Projects → UniCab → Competencies) | `content/projects/unicab/competencies/` |
| A research paper: its title, course, co-authors and abstract | `content/research/` (one file each) |
| Email, GitHub, LinkedIn and the menu | `hugo.toml` |
| The order of the home page's sections (keep the menu in `hugo.toml` in the same order) | `$sections` in `layouts/home.html` |
| The ocean zones the sections dive through | `data/zones.yaml` |
| The sea life drawn in each zone's margin (turtle, jellyfish, anglerfish, snailfish), the reef at the bottom of the first section, and the wreck on the seafloor | `layouts/_partials/marine-life.html`, `reef.html`, `seafloor.html` |
| Colors, fonts and layout (the colors are at the top) | `assets/css/main.css` |
| The phone menu, scroll effects (the sunset too), the depth gauge and the video player | `assets/js/main.js` |
| The HTML around the content | `layouts/` |

To add a paper, run `hugo new research/short-name.md`; for a project, `hugo new projects/short-name/index.md`. Each makes a file with every field to fill in.

Each award is a row with a gold medal. To show a photo under one, put it in `static/images/awards/` and give the award `image:` and `alt:` in `data/experience.yaml` (the comment above `awards:` there shows how). An experience can have a YouTube `video:` too, like Joppa's: the page shows its thumbnail (kept in `static/images/`) and plays it in place when clicked.

## PDFs

The PDFs the site links to live in `static/documents/`: the three papers (each paper's title opens its PDF), a résumé without the home address and phone number, and the unofficial Grinnell transcript (the Education card's "Unofficial transcript (PDF)" button), exactly as the college printed it except for the student ID, which is covered by a visible black bar and removed from the text. The originals in `Website/` stay out of git. A paper's title, or a "Résumé (PDF)" or "Unofficial transcript (PDF)" button, only becomes a link when its PDF is in `static/documents/`, so the site never links to a missing file.

### Competency write-ups

The list of competencies (basic and advanced, by area) is at the top of `content/projects/unicab/competencies/_index.md`. Each write-up is its own page in that folder, named after the competency in lowercase with dashes for spaces, for example `medium-scale-abstraction.md`; its card on the Competencies page then turns from "Coming soon" into a link. A PDF works too: put it in `static/documents/competencies/`, named after its level and competency, for example `basic-testing-strategies.pdf`. If `hugo server` is already running, restart it to see a new PDF.

## Publishing

Not set up yet. The plan is GitHub Pages, built by a GitHub Actions workflow, at https://koast-g.github.io/personal-website/.
