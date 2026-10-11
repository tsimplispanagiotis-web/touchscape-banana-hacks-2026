# ✳ TOUCHSCAPE — Make images touchable.

> **Banana Hacks 2026 · Image AI · Open-source research prototype**
>
> Turn a photograph into an editable, tactile-inspired SVG draft by combining on-device monocular depth estimation, neural semantic segmentation, and a custom geometric vectorization engine.

![Original illustrated coastal scene](assets/sample-coast.jpg)

![Tactile transformation](assets/demo-tactile-preview.png)

## The idea

Pictures are increasingly central to how people learn, remember, and share information. Raised-line illustrations and tactile maps can communicate some of that information through touch, but manually translating visual structures into accessible diagrams takes specialist time. **Touchscape experiments with an AI-generated first draft**—not a finished accessibility product—so educators, makers, and accessibility practitioners can refine it for real people.

Touchscape is not merely a filter: image-derived *relative depth* creates spatial contours, while a separate *semantic segmentation model* identifies major scene regions. The algorithm maps them into a legible, editable SVG draft with patterned regions, numbered landmarks, and a legend. No paywalled API is required.

## What works

- Drag/drop a JPG, PNG, or WebP photo; responsive editor and on-device resizing.
- **NEW:** immediate offline-friendly color-region and luminance preview on uploads, labelled **NON-AI**, with editable SVG/PNG/JSON exports.
- **NEW:** independent model recovery: trained depth and semantic segmentation can each work even if the other fails; explicit inference provenance and scene guards.
- Load **real pre-trained image models** using Transformers.js and ONNX Runtime Web (requires connectivity for first model download).
- **Depth Anything**: monocular relative depth map for 2.5D isocontours.
- **SegFormer ADE20K**: pixel masks for scene regions.
- Custom **marching squares**, contour stitching, polygon boundary simplification and sparse vector texture generation.
- Three compositional modes: Hybrid, Semantic and Depth. Interactive contour density and region selection.
- Side-by-side original/vector slider; downloadable SVG and cropped PNG preview.
- Interactive scene legend with uncontracted visual braille transliteration and opt-in browser text-to-speech.
- Measured **SVG vector path counts** and density category (not a tactile-readability score) and clear safety/accessibility limitations.
- Bundled illustrative scene and sample output for immediate use; **the precomputed illustration is not a live neural inference**.

## Run locally

Requirements: modern Chromium, Firefox or Safari; Python 3 (or any static server) and Internet connectivity to download the ML models *on first AI run*.

```bash
cd TOUCHSCAPE_BananaHacks2026
python3 -m http.server 5173
```

Open **http://localhost:5173**.

Select **Run real AI analysis** to download the models and infer depth and semantic labels locally. The first download may take several minutes; subsequent sessions can use browser cache. On memory-constrained devices, run on desktop Chrome or Firefox. If downloads are blocked, the clearly labelled illustrative sample remains available to demonstrate the vectorization pipeline.

Do **not** open `index.html` directly from a `file://` URL; browser security restrictions can break ES modules and image canvases.

### Deploy

The app is **static**: no backend, no build step, no environment secrets and no paid service. Upload the contents of this folder to **GitHub Pages, Netlify, Cloudflare Pages or Vercel**. On GitHub Pages, select the repository root as publish directory. For other static hosts, set the output/public directory to the root and leave the build command blank.

Browser inference loads external model weights from Hugging Face CDN; host on HTTPS or localhost for best compatibility. **The two-model neural path has not been end-to-end validated in this network-restricted build environment; test it in an internet-connected desktop browser before representing it as verified.** No user photos are sent to a server. Model downloading is a network operation, but the image inference runs in the browser.

## Architecture

```text
LOCAL PHOTO (browser FileReader)
   │
   ├─ [Depth Anything small / ONNX] ── relative depth raster ─┐
   │                                                          │
   └─ [SegFormer B0 / ONNX] ── pixelwise semantic masks ──────┤
                                                              ▼
                     NORMALIZE + SELECT REGIONS + SMOOTH
                                                              │
                          CUSTOM VECTOR ENGINE               │
                          ├─ marching squares                │
                          ├─ segment adjacency / joins       │
                          ├─ Ramer–Douglas–Peucker simplify  │
                          ├─ stippling / hatch patterns      │
                          └─ scene number markers            │
                                                              ▼
                                EDITABLE SVG + KEY
                                    │           │
                             PRINT DRAFT    PNG PREVIEW
```

The model inference code is in [`src/app.mjs`](src/app.mjs). The non-neural preview is explicitly marked. The vector engine is independently testable in [`src/core.mjs`](src/core.mjs). The included sample illustration and its depth/segmentation grids are **author-created demo art and handcrafted ground truth**: they enable immediate experimentation even before model downloads. For your own photograph, upload an image for an instant **NON-AI color/luminance** preview; click *Run real AI analysis* to use neural depth plus semantic segmentation.

### Human-in-the-loop improvements (v1.2)

- **Correct AI labels in the inspector:** use the pencil control to rename an incorrect detected region. Human corrections appear in the JSON manifest and resulting SVG.
- **Focus on 4 key regions:** one-click simplification selects the dominant regions, reduces contour complexity, and disables extra texture noise without making tactile accessibility claims.
- **Review handoff:** export a plain-text specialist checklist listing the actual source mode, region names, vector complexity, braille translation and embossing cautions.
- **Independent model fault tolerance:** a working SegFormer result is usable even if Depth Anything fails, and vice versa; honest partial-neural provenance is displayed.
- **Explicit path-count indicator:** replaces an unvalidated pseudo-quality rating with real vector path counts and visual-density labels.

### Model credits

- **Depth Anything (small, Hugging Face-compatible)**: `Xenova/depth-anything-small-hf`. Original: `LiheYoung/depth-anything-small-hf`. [Model card](https://huggingface.co/Xenova/depth-anything-small-hf).
- **SegFormer B0 on ADE20K**: `Xenova/segformer-b0-finetuned-ade-512-512`. Original: `nvidia/segformer-b0-finetuned-ade-512-512`. [Model card](https://huggingface.co/Xenova/segformer-b0-finetuned-ade-512-512).
- **AI-assisted development disclosure**: ChatGPT (OpenAI GPT family) was used for brainstorming, code generation, debugging, visual design, documentation and test development. The entrant is responsible for verifying and representing the final work accurately.
- **Browser runtime**: [Hugging Face Transformers.js](https://github.com/huggingface/transformers.js) and its ONNX Runtime backend. The browser loads the module from jsDelivr, with a second ESM CDN option when the first fails.

Model weights, model training datasets and inference runtime are **third-party work**, not authored or trained during the event. Touchscape's new work comprises the app UX, dual-model orchestration, image-to-vector translation, interaction and sample assets. Follow third-party licenses when distributing weights; this repository does not redistribute third-party model binaries.

## Validate

The synthetic-model contract tests in `tools/mock_inference_smoke.py` exercise all four model success/failure permutations without claiming real downloaded weights were tested. Browser tests in `tools/smoke_release.py` validate real UI interaction on desktop/mobile via locally inlined sample assets, since this development container blocks local HTTP in Chromium.


```bash
node --check src/app.mjs
node --check src/core.mjs
npm test
```

Includes **22 passing unit tests** for color-region clustering, mask denoising, selected-region effects, SVG escaping, pixel alignment, depth normalization, closed contour extraction, semantic statistics, XML escaping, SVG output and the visual braille alphabet mapping.

## Physical-size Print Lab (v1.3)

**New in 1.3:** `src/print.mjs` generates an independent **A4 landscape SVG with `width="297mm" height="210mm"`**. Unlike the original full-color explanatory poster, the Print Lab output is a limited-complexity black-and-white review sheet with region contours, subtle dashed relative-depth indications, selected region numbers, a printed legend and fabrication cautions. Its physical dimensions are real; its tactile legibility is **not** established.

- The deliberate output budgets are at most **230 semantic and 100 depth paths**, at most **five** salient regions, and label-placement attempts designed to avoid collisions. Black semantic strokes are specified at **0.65 mm**, dashed depth lines at **0.27 mm**. These are technical SVG parameters, **not certified tactile-graphics standards**.
- The A4 file is exportable as a separate button in the studio, and can be reviewed, edited or opened in vector-design software. Do not send it to a braille embosser without specialist configuration and reader testing.
- `assets/sample-a4-print.svg` and `assets/sample-a4-preview.png` demonstrate the original **hand-authored sample**, not an AI prediction.
- The faster-first-result neural workflow attempts **SegFormer segmentation first**, renders any successful semantic masks immediately, then attempts the heavier Depth Anything model. Four synthetic success/failure combinations are exercised in browser tests; real model downloads are still unverified here.

![Physical-size A4 print study from the hand-authored sample](assets/sample-a4-preview.png)

## Responsible design and limitations

- **Not a certified braille, embossed-image, or assistive-technology product.** It produces an **editable draft**, not a guaranteed accessible tactile diagram.
- The output is **not printed embossing height**; ordinary ink on paper cannot itself form raised lines. Use an appropriate tactile graphics process and consult specialists.
- The braille Unicode text is a **visual grade-1 letter mapping**, not an embosser-ready braille translation. Capital letters, contractions, numbers and layout require proper translation and hardware-specific formatting.
- Relative depth is **not metric distance**, and geometry should not be trusted for navigation or safety.
- Semantic labels may be wrong. A person should verify them, correct composition, measure physical line width/spacing, and test with blind or low-vision users before use.
- Dense/complex photographs may result in cluttered SVGs; simplify or filter regions.
- Inference performance, available RAM and model CDN access vary by browser. The illustrative sample is always available.
- No interviews, adoption figures, user studies, formal accessibility testing or performance benchmarks are claimed.

## Team and competition

Prepared specifically for Banana Hacks 2026 during the October 9–11 hacking window; the entrant should verify first commit dates and authorship before submission. The official Devpost requires project name, source repo, project description and an at-most-three-minute **public YouTube demo**, with no cross-hackathon submission. This local folder is prepared for GitHub but is **not automatically uploaded or submitted**.

The source (excluding model weights) is licensed MIT. See [LICENSE](LICENSE).

## Competition acknowledgement and build provenance

Banana Hacks 2026 explicitly permits generative AI development assistance but requires it to be disclosed. This project was created with substantial ChatGPT assistance during the hackathon window. The model weights, Transformers.js and original scientific models are third-party resources; none were trained by the entrant. The public Git commit(s) should be made **with truthful dates** within the event's hacking window. Do not imply that generated assets or sample masks were independently predicted by a model.

## Submission media

- [`assets/devpost-cover.png`](assets/devpost-cover.png) — project cover / thumbnail.
- `TOUCHSCAPE_v1.3_SAMPLE_ONLY_DEMO.mp4` — 86-second walkthrough with actual sample/offline UI interaction and a print-lab visual. This is **not** a recorded neural inference and should never be described as one.
- [`START_HERE_GR.md`](START_HERE_GR.md) — Greek submission checklist.

## Recorded sample-mode walkthrough

`TOUCHSCAPE_v1.3_SAMPLE_ONLY_DEMO.mp4` is an 86-second video containing **genuine app interaction in illustrative and non-neural modes** plus an engineering explanation. **No neural inference is portrayed as successful in this video.** To maximize the Image AI judging criterion, record and substitute a genuine successful two-model inference before submission, if it works on your machine.

## Deterministic engine benchmark

`node tools/benchmark_engine.mjs` reproduces `VECTOR_BENCHMARKS.json` with simple 168×109 synthetic patterns, seven runs per scene, SVG path counts, exact output hashes and wall-clock medians. These are measurements of our geometry engine on this container; **not AI model inference benchmarks or tactile usability validation**. A hard budget caps exports to 2,500 vector paths and 1,800 texture marks to reduce browser stalls on complex inputs.
