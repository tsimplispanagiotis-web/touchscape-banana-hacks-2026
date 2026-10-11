# Touchscape — How to demonstrate the five Banana Hacks criteria

These are **positioning points**, not guaranteed scores. The judges score all five equally.

| Official criterion | Concrete evidence already in this repository | What to show live | Remaining risk |
| --- | --- | --- | --- |
| Technical execution & difficulty | Dual ONNX vision pipeline, model memory lifecycle, custom marching squares, segment stitching, polyline simplification, texture vectorization, SVG generator, tests | `src/core.mjs`, model status indicators, editable exported SVG | Browser model integration needs verification; no first-party model training |
| Innovation & creativity | Cross-modal transformation: photographs → tactile-inspired spatial diagram, not another text-to-image wrapper | Original/translation reveal, semantic/depth modes | Other tactile graphics tools exist; avoid claiming this is the first-ever solution |
| Image AI theme | Neural depth and pixel segmentation drive the actual exported paths | Upload a new natural photo, infer both models, toggle a label and show contours change | Offline *demo sample* alone does not prove model inference |
| Impact & usefulness | Target: tactile graphics educators and accessible-content creators; exportable SVG draft can fit an editorial workflow | Export SVG and open it in Inkscape/Illustrator; explain human review | No user testing or demonstrated accessibility benefit yet |
| Design, presentation & demo | Polished responsive studio, image comparison, control panel, scene inspector, sample artwork, original promo | 2:40 live demonstration from script with precise before/after | Must publish live URL, GitHub repo and ≤3:00 public YouTube video |

## Strongest demo narrative

> "This isn't an image filter. It's a translation engine: one model reasons about distance, one model reasons about things, and a third layer of code turns both into editable geometry. Instead of generating another picture, it creates a different way to explore one."

## Avoid overclaiming

- It does **not** produce instantly usable certified tactile graphics.
- The accompanying samples are illustrative ground truth, not evidence of live model accuracy.
- It is new app engineering on top of **pretrained models**, not a newly trained foundation model.
- No interviews, partnerships, clinical evidence or usage figures are claimed.
- The product is **eligible to compete**, but no win is guaranteed.

## Last-minute quality gate

- [ ] Brand landing page opens on a public HTTPS URL, with no login requirement.
- [ ] `Run real AI analysis` works on two natural photos in a desktop browser.
- [ ] Video explicitly shows one actual run, not solely the handcrafted sample.
- [ ] A generated SVG opens in a second program and remains editable vector lines.
- [ ] Browser mobile layout doesn't overlap important controls.
- [ ] `npm test` passes and browser console has no runtime errors.
- [ ] GitHub repo is public, committed during the hacking window, with model citations.
- [ ] YouTube video is **public** and runtime ≤ 3:00; audio and captions are readable.
- [ ] Entry is submitted through the official portal before the *earliest* displayed deadline.
