# TOUCHSCAPE — BANANA HACKS 2026

**Project name:** Touchscape  
**Tagline:** What if you could feel a photograph?  
**Category:** Image AI · Accessible Design · Education · Developer Tools  
**GitHub:** **REPLACE:** `https://github.com/YOUR_HANDLE/touchscape-banana-hacks-2026`  
**Live demo:** **REPLACE:** `https://YOUR-LIVE-DEPLOYMENT`  
**Public YouTube (strictly ≤3:00):** **REPLACE:** `https://youtu.be/YOUR_VIDEO_ID`  
**Team:** **REPLACE with your Devpost profile(s)**

---

## Inspiration

Images are the language of modern education, but translating them into tactile graphics demands significant expertise. We asked a different question from typical image-generation projects: **Could image AI help people begin translating a visual scene into a geometry-based draft meant for touch?** We built Touchscape to explore this as a human-guided workflow, not to replace accessibility professionals.

## What it does

Upload a photograph to the Touchscape studio. A two-model vision pipeline is designed to extract **relative depth** and **semantic region masks**, which a custom vectorization engine translates into depth contours, object boundaries, patterned regions, numbered landmarks, and a visual legend. Change contour detail, correct labels detected incorrectly, focus on four major regions, hide cluttered regions, switch translation styles, compare the original with the draft, and export genuine editable **SVG**, a PNG preview, a human-review handoff checklist, a machine-readable JSON analysis with recorded label corrections, and a separately designed **A4 print-scale SVG with measurements in millimetres**.

Importantly, a separate **clearly labeled non-AI preview** works instantly without model downloads; the bundled example is **hand-authored illustrative data**, not a claimed inference result.

## How we built it

We integrated pretrained **Depth Anything (small)** for monocular depth and **SegFormer B0 (ADE20K)** for image segmentation with **Transformers.js / ONNX Runtime Web**. The browser requests model weights; the application processes uploaded images locally. The smaller SegFormer model is attempted first so its successful output can become visible while the larger depth model downloads. Our new, dependency-free geometry kernel implements marching squares, contour joining, polyline simplification, semantic mask filtering, texture generation, and annotated vector export. If one neural model fails but the other completes, the app shows a clearly labelled partial-model result rather than discarding the working output. The fallback performs deterministic spatial color clustering, with provenance recorded in the interface, SVG and JSON exports. The optional A4 Print Lab limits geometry to five regions, puts its strokes in physical millimetre units, and includes printed warnings that the result still needs tactile-graphics specialists. The interface is responsive and includes 22 automated unit tests plus tested browser interaction on desktop and mobile.

## Challenges & what we learned

Raw predicted boundaries are visually noisy. We needed to turn pixels into sparse, controllable structure without passing a raster image off as vector art. We also addressed interrupted model workflows, fast local fallbacks, and explicit labeling so illustrative output could never be confused with verified AI inference. A compelling image is not automatically a physically readable tactile graphic.

## What's next

Validate downloaded model inference end-to-end on a real unrestricted browser; test real images with tactile-graphics educators and blind or low-vision users; validate the existing A4 physical-size print profile with tactile specialists; and integrate embosser-specific export tools. Touchscape is an **experimental editing prototype**, not a certified accessibility device or an embossed graphic.

---

## Resources and AI disclosure

- Models: [`Xenova/depth-anything-small-hf`](https://huggingface.co/Xenova/depth-anything-small-hf), [`Xenova/segformer-b0-finetuned-ade-512-512`](https://huggingface.co/Xenova/segformer-b0-finetuned-ade-512-512)
- Runtime: [`@huggingface/transformers`](https://github.com/huggingface/transformers.js), ONNX Runtime Web
- Generative AI assisted with brainstorming, writing code, interface design, debugging, tests, and presentation material: **ChatGPT (OpenAI)**. The pretrained models and their training data are credited to their creators.
- No training of a custom model, certified tactile usability, user studies, adoption metrics, or live two-model inference test in this restricted build environment is claimed.

### Submission integrity check

**Before submitting, replace all placeholders, verify actual model inference if describing it as working, and ensure the YouTube video is public and ≤3:00.** If the AI test still fails, keep the honest sample-only walkthrough but recognize that the Image AI scoring criterion may suffer. Commit to the public repository with genuine timestamps inside the October 9–11 hackathon window; do not backdate commits.
