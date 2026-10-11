# TOUCHSCAPE 1.3 — ΟΔΗΓΟΣ ΤΕΛΙΚΗΣ ΥΠΟΒΟΛΗΣ (BANANA HACKS 2026)

## ΠΡΟΘΕΣΜΙΑ — ΜΗΝ ΤΗ ΧΑΣΕΙΣ

**Devpost: Δευτέρα 12 Οκτωβρίου 2026, 07:00 π.μ. ώρα Ελλάδας** (Oct 12, 12:00am EDT). Υπάρχει ασυμφωνία με αναφορά AoE στην ιστοσελίδα των διοργανωτών. Ακολούθησε τη **ΝΩΡΙΤΕΡΗ ώρα στο Devpost**. Υπέβαλε αρκετά νωρίτερα, όχι την τελευταία στιγμή.

**Devpost:** https://banana-hacks-1111.devpost.com/ ή https://devpost.com/submit-to/30491-banana-hacks/manage/submissions

**ΠΡΟΣΟΧΗ:** Ο κανονισμός ορίζει ότι τα πρωτότυπα έργα πρέπει να έχουν γίνει στο hacking window, οι πραγματικές ημερομηνίες commit πρέπει να ανήκουν σε αυτό, και οι συμμετέχοντες κάτω των 18 καλούνται να διαβάσουν τους κανόνες με γονέα/κηδεμόνα. Επιτρέπεται η χρήση ChatGPT αλλά πρέπει να δηλωθεί. Δεν παραποιούμε ημερομηνίες, demo ή επίδοση του AI.

## ΤΙ ΚΑΤΕΒΑΖΕΙΣ

- `TOUCHSCAPE_BananaHacks2026_GITHUB_SOURCE_v1.3.zip` — μόνο αυτό ανεβαίνει ΑΠΟΣΥΜΠΙΕΣΜΕΝΟ στο GitHub (πηγαίος κώδικας, στοιχεία της εφαρμογής, README, unit tests). Στη ρίζα του GitHub πρέπει να βλέπεις `index.html`, `src/`, `assets/`, `tests/`, `README.md`.
- `TOUCHSCAPE_BananaHacks2026_FINAL_v1.3.zip` — πλήρες συνοδευτικό πακέτο, συμπεριλαμβανομένων βίντεο, Devpost κειμένου και οδηγιών.
- `TOUCHSCAPE_v1.3_SAMPLE_ONLY_DEMO.mp4` — προαιρετικό 86-second αληθινό sample/offline walkthrough, **χωρίς επιτυχημένη πραγματική inference**.
- `DEVPOST_SUBMISSION.md` — έτοιμα αγγλικά κείμενα για το submission (με υποχρεωτικά placeholders που θα συμπληρώσεις).

## 1. ΔΗΜΙΟΥΡΓΕΙΣ ΔΗΜΟΣΙΟ GITHUB (υπολογιστής, 3–6 λεπτά)

1. Κατέβασε το `GITHUB_SOURCE_v1.3.zip` και **αποσυμπίεσέ το** με Extract All/Αποσυμπίεση. ΜΗΝ ανεβάσεις απλά ένα ZIP μέσα στο repository.
2. Άνοιξε https://github.com/new, συνδέσου, Repository name: `touchscape-banana-hacks-2026`.
3. Διάλεξε **Public**, πάτησε **Create repository**. Μην τσεκάρεις νέο README — υπάρχει ήδη.
4. Πάτησε **uploading an existing file** στο άδειο repository (ή `Add file → Upload files`).
5. Άνοιξε τον αποσυμπιεσμένο φάκελο στον υπολογιστή. Επίλεξε **όλα τα περιεχόμενά του** (Ctrl+A σε Windows / Cmd+A σε Mac) και σύρε τα μαζί στο πλαίσιο `Drag files here to add them to your repository` του GitHub. Εναλλακτικά χρησιμοποίησε `choose your files` και ανέβασε όλους τους φακέλους με τρόπο που να διατηρεί τη δομή τους.
6. Περίμενε να φορτώσουν. Γράψε commit message `Banana Hacks 2026 — Touchscape v1.3` και πάτησε **Commit changes**.
7. Στην κεντρική σελίδα του repository πρέπει να υπάρχουν ακριβώς ο φάκελος `src`, ο φάκελος `assets`, ο φάκελος `tests`, το `index.html`, το `README.md`, το `package.json`. Αν έχει μόνο ZIP ή έναν εξωτερικό φάκελο, το ανέβασμα θέλει διόρθωση.
8. Αντέγραψε το URL από τη γραμμή του browser. Παράδειγμα μορφής: `https://github.com/YOUR_USERNAME/touchscape-banana-hacks-2026`. **Αυτή είναι μόνο ενδεικτική μορφή, όχι ήδη δημιουργημένο link.**

## 2. ΚΑΝΕ ΤΟ WEBSITE LIVE ΜΕ GITHUB PAGES (2–5 λεπτά)

1. GitHub repository → **Settings** → **Pages** (αριστερό μενού).
2. Build and deployment → Source: **Deploy from a branch** → Branch: **main** → Folder: **/(root)** → **Save**.
3. Περίμενε 1–5 λεπτά και κάνε refresh στο Settings → Pages μέχρι να εμφανιστεί το πραγματικό δημόσιο URL της εφαρμογής. Το τυπικό URL είναι `https://YOUR_USERNAME.github.io/touchscape-banana-hacks-2026/` αλλά **δεν είναι ενεργό μέχρι να ολοκληρωθεί το deployment**.
4. Άνοιξέ το σε incognito και έλεγξε ότι φορτώνει χωρίς login. Κοίτα source photo, sample scene, region list, export SVG και A4 Print Lab. Δοκίμασε δική σου JPG/PNG.

## 3. ΕΠΙΒΕΒΑΙΩΣΕ ΠΡΑΓΜΑΤΙΚΟ IMAGE AI

1. Σε υπολογιστή με **Chrome ή Edge**, σύνδεση Internet και κατά προτίμηση αρκετή διαθέσιμη RAM, άνοιξε το live URL.
2. Ανέβασε μία δική σου μη ευαίσθητη φωτογραφία (JPG/PNG), όχι μόνο το σχεδιασμένο sample.
3. Πάτα **Run real AI analysis**. Το **SegFormer** θα δοκιμαστεί πρώτο και το **Depth Anything** δεύτερο. Το πρώτο download των pretrained weights ενδέχεται να κρατήσει αρκετά λεπτά.
4. Αν εμφανιστεί `DUAL-MODEL AI`, άνοιξε Analysis JSON και βεβαιώσου ότι γράφει `dual-model-neural-inference` και αναφέρει και τα δύο πραγματικά model IDs. Τότε έχεις τεκμηριώσει επιτυχημένο dual-model run και μπορείς να το δείξεις στο video.
5. Αν γράφει `PARTIAL`, ολοκληρώθηκε μόνο ένα μοντέλο. Αν γράφει `OFFLINE · NON-AI` ή `ILLUSTRATIVE SAMPLE`, **δεν** έχει τεκμηριωθεί neural inference. Μη γράψεις στο Devpost ή πεις στο βίντεο ότι τα δύο μοντέλα εκτελέστηκαν επιτυχώς αν δεν το είδες.
6. Μετά χρησιμοποίησε **Focus on 4 key regions**, αλλαγή label με ✎, SVG export, **A4 Print Lab SVG**. Το A4 είναι φυσικά μετρημένο σε mm αλλά **δεν** είναι πιστοποιημένο αρχείο braille/embossing.

## 4. YOUTUBE VIDEO (PUBLIC, ≤ 3 λεπτά)

Το έτοιμο `TOUCHSCAPE_v1.3_SAMPLE_ONLY_DEMO.mp4` (86 δευτερόλεπτα) είναι ειλικρινές και δείχνει μόνο λειτουργίες του sample/offline mode. Μπορείς να το ανεβάσεις γρήγορα, αλλά θα είναι πιο ανταγωνιστικό **εάν καταγράψεις πραγματικό επιτυχημένο AI run και προβάλλεις το αποτέλεσμα μαζί με το A4 Print Lab**.

- Πήγαινε https://studio.youtube.com/ → **Create → Upload videos**.
- Διάλεξε το MP4, βάλε τίτλο `TOUCHSCAPE — Banana Hacks 2026 | Image AI to Tactile Vector Drafts`.
- Περιγραφή: `Touchscape converts photographs into editable tactile-inspired vectors. This sample walkthrough demonstrates real editor interactions and a print-scale A4 draft. Pretrained model inference is not shown in this recording.` (χρησιμοποίησε αυτή τη φράση για το υπάρχον sample-only video).
- Visibility: **Public** (όχι Private ή Unlisted, εκτός αν οι διοργανωτές επιβεβαιώσουν ότι Unlisted επιτρέπεται) → Publish. Έλεγξε από άλλο browser ότι παίζει.
- Αν φτιάξεις νέο demo με πραγματικό AI, δείξε το actual output, όχι συνθετική αντικατάσταση, και κράτα το ≤3:00. Μην χρησιμοποιήσεις το teaser ως απόδειξη πραγματικής inference.

## 5. ΤΕΛΙΚΗ ΥΠΟΒΟΛΗ ΣΤΟ DEVPOST

1. Devpost: https://banana-hacks-1111.devpost.com/ → Join (αν δεν έχεις ήδη εγγραφεί) → Submit project.
2. **Project name:** `TOUCHSCAPE`
3. **Elevator pitch:** `Turning photographs into editable, human-reviewed tactile vector drafts with image AI and custom geometry.`
4. **Story / description:** copy/paste από `DEVPOST_SUBMISSION.md` (Inspiration, What it does, How we built it, Challenges, What's next, AI disclosure). Προσθέτεις μόνο αληθείς πληροφορίες.
5. **GitHub / Source:** βάλε το πραγματικό link του Public repository.
6. **Demo Video:** βάλε το πραγματικό Public YouTube URL διάρκειας ≤3 λεπτά.
7. **Live Demo:** βάλε το πραγματικό GitHub Pages URL (όταν είναι όντως προσβάσιμο) αν υπάρχει πεδίο.
8. **Gallery/thumbnail:** ανέβασε `assets/devpost-cover.png` και, αν επιτρέπεται, `assets/sample-a4-preview.png` (βάλε λεζάντα **illustrative sample; no neural inference claimed**).
9. **Team:** τον δικό σου Devpost λογαριασμό, με σωστές πραγματικές δηλώσεις για εργασία και χρήση AI. Μη συμπληρώνεις δεύτερο μέλος που δεν συμμετείχε.
10. Πάτα **Submit/Publish** στο τελευταίο βήμα και **επιβεβαίωσε ότι εμφανίζεται Published/Submitted**, όχι Draft. Κράτα το URL της υποβολής.

**Αν ο χρόνος τελειώνει:** Δημόσιο GitHub → public YouTube (το ειλικρινές 86s sample demo αν δεν προλαβαίνεις νέο) → Devpost Submit ΠΡΙΝ τις 07:00. Η φιλοξενία του website είναι χρήσιμη αλλά δεν αναφέρεται ως υποχρεωτικό πεδίο στους δημόσιους κανόνες. Προτεραιότητα είναι μια ΕΓΚΥΡΗ υποβολή στην ώρα της.

## ΕΝΑΛΛΑΚΤΙΚΟ: ΑΝ ΕΙΣΑΙ ΜΟΝΟ ΑΠΟ iPHONE

Έχεις και **έτοιμο αρχείο `index.html` ενός μόνο αρχείου**, χωρίς φακέλους και χωρίς unzip. Είναι το *ίδιο functional app* με την HTML/CSS/JS/εικονογράφηση ενσωματωμένα, αλλά ΔΕΝ περιέχει model weights και ΔΕΝ αντικαθιστά την πλήρη κανονική source repository για την ισχυρότερη τεχνική παρουσίαση.

1. Κατέβασε από αυτή τη συνομιλία το **ONE-FILE GitHub `index.html`** στο Files του iPhone.
2. GitHub → new Public repository `touchscape-banana-hacks-2026` → **uploading an existing file**.
3. Πάτα `choose your files` → διάλεξε το συγκεκριμένο `index.html` από Files, **χωρίς να το μετονομάσεις**.
4. Πάτα Commit changes. Έπειτα Settings → Pages → main → /(root) → Save.
5. Έλεγξε το public site. Όταν μπορέσεις από laptop, ανέβασε και τα ξεχωριστά source files από το full GitHub ZIP ώστε το repo να είναι τεκμηριωμένο με τα tests και τα modules. Για το Devpost βάλε το πραγματικό repository link, όχι το αρχείο sandbox.

**Ακόμα και στην επείγουσα one-file διαδρομή, παραμένει απαραίτητο να ανεβάσεις public YouTube demo και να ολοκληρώσεις την υποβολή στο Devpost εντός χρόνου.**
