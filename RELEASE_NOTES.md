# TOUCHSCAPE — Banana Hacks 2026 final release v1.3 (11 October 2026)

## Competition-oriented improvements

1. **NEW A4 Print Lab:** independent `src/print.mjs` creates a precisely sized 297 × 210 mm landscape SVG (five selected regions maximum, 230 semantic paths and 100 relative-depth paths maximum, numbered landmarks and plain-text legend). It is a review draft, not an embossing-certified file.
2. **Faster first neural result:** SegFormer is now attempted before Depth Anything, and successful neural semantic masks render progressively while the larger model loads. An independent model failure does not discard the working result.
3. **Evidence-driven documentation:** clearly separates verified vector/UI behavior, mocked model contracts, and **unverified** external pre-trained model execution.
4. **Transparent human review:** semantic label correction, Focus on four regions, human-review handoff, source provenance labels and vector diagnostics retained.
5. **New release media:** print-scale sample SVG/preview, annotated print-lab demo card, refreshed cover, 86-second honest sample/offline walkthrough.

## Testing performed

- `npm test`: **22/22 PASS**; includes physical geometry bounds, deterministic outputs, unsafe XML escape, missing data, path budgets, and non-neural fallbacks.
- `python tools/smoke_release.py`: desktop and mobile Chromium smoke tests PASS; actual browser downloads of the sample SVG, A4 physical-size SVG (parsed as XML), JSON analysis, review handoff, and user image upload; no page JavaScript errors.
- `python tools/mock_inference_smoke.py`: all four synthetic inference permutations PASS (both succeed, segmentation-only, depth-only, neither); **real neural model weights not downloaded or executed**.
- `assets/sample-a4-preview.png`: visual screenshot of genuine output from the A4 generator, based on the clearly attributed hand-authored demonstration scene.

## To be done by the entrant

Public GitHub commit in official window, GitHub Pages deployment, public <=3-minute YouTube demo, and final Devpost submission. The actual pretrained-model pipeline requires an internet-connected browser test. This workspace has no external model download access. There is no claim of validated tactile comprehension, tested braille-embosser compatibility, user adoption or verified social impact.
