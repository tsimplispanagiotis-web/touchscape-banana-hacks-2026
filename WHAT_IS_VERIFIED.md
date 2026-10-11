# TOUCHSCAPE 1.3 — Verification and evidence matrix

| What is claimed | Status | Evidence or limitation |
|---|---|---|
| Sample artwork generates true vector paths and SVGs | **Verified locally** | Real Chromium render and download in two viewport sizes |
| User photos give non-neural color/luminance drafts | **Verified locally** | Actual browser-upload test, explicitly labelled NON-AI |
| Human corrections, Focus, selection, exports work | **Verified locally** | Unit tests + browser downloads, corrected JSON and SVG |
| A4 print study is exported in correct millimetres | **Verified locally** | Browser-generated file parsed as XML; width 297mm, height 210mm |
| Print Lab stays within deterministic path budgets | **Verified locally** | `tests/print.test.mjs` and generated sample |
| SegFormer-first AI pipeline handles success/failure | **Verified with synthetic mocks only** | 4/4 mock browser cases; no real model weights |
| Real SegFormer image inference on an unrestricted browser | **NOT YET VERIFIED** | Model download blocked by development environment |
| Real Depth Anything inference on an unrestricted browser | **NOT YET VERIFIED** | Model download blocked by development environment |
| GitHub Pages and public YouTube links | **NOT DEPLOYED** | Requires user-account publication |
| Compliance with tactile fabrication standards | **NOT CLAIMED** | No braille translation, embossing test, or specialist signoff |
| Usability for blind readers | **NOT CLAIMED** | No real reader study or physical tactile evaluation |
| Adoption or external impact statistics | **NOT CLAIMED** | No user counts, partnerships, or accessibility efficacy invented |

**Please tell judges precisely what was tested.** The existing sample walkthrough is genuine UI interaction, not demonstration of successfully executed pretrained neural inference.
