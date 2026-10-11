# 2:40 DEMO VIDEO — STORYBOARD AND VOICEOVER

**Official rule:** upload a **public YouTube video strictly no longer than 3:00**. This is a production script for an actual screen recording; do not claim an inference ran if it did not.

| Time | What is on screen | Words to say |
|---|---|---|
| 0:00–0:16 | Full-screen original lighthouse scene. Match-cut to exported tactile SVG. | "We see thousands of images every day. But what if an image could be explored by touch? This is Touchscape." |
| 0:16–0:37 | Show the studio. Drag a **different photograph** into the input. | "Touchscape turns a photo into a tactile vector *draft*. Not just black and white: the output preserves spatial depth and semantic meaning." |
| 0:37–1:09 | Hit Run real AI analysis **on video**, showing statuses and completion. For filming, preload models once so the second run is faster. | "SegFormer detects semantic regions first; Depth Anything then adds relative depth. Both are designed to run in the browser. The image stays on this device." |
| 1:09–1:33 | Move the comparison slider. Show contour lines tracing the photo, then select a region and switch between Hybrid, Objects, Depth. | "A custom marching-squares engine follows depth boundaries. A second vector layer traces recognizable objects. Both feed a simplified, editable visual language." |
| 1:33–1:57 | Change detail slider and tactile textures; correct a mislabeled region with the pencil control, click Focus on 4 key regions, then listen to the narration. | "I can remove clutter, highlight the useful structures, change the density of contours, or hear a short scene reading." |
| 1:57–2:21 | Export the separate A4 Print Lab SVG and human-review handoff guide. Open SVG showing full legend. Show before/after side by side. | "The result is genuine vector geometry. In Print Lab I can export an A4-size study in millimetres, with simplified lines, a legend and explicit human-review cautions." |
| 2:21–2:40 | Founder speaks or desktop shows code for vector engine and final product. | "It's a prototype, not certified tactile output. But imagine a future where educators can create a first draft for a new tactile diagram in seconds, and then refine it with people who actually use it. Touchscape makes that first step possible." |

**Shot-production notes:**

1. Record 1920×1080 landscape using OBS or your device's screen recorder. Keep mouse movement deliberate and readable.
2. Use the built-in illustrative sample for the opening; **clearly distinguish it from genuine model inference** and run inference on a newly uploaded photo for the actual demonstration.
3. The sample preview is an author-designed image with author-created labels. Never portray it as neural output.
4. Do a dry run before recording: model download may take several minutes and memory use is high. If inference fails on your hardware, **do not fabricate a success clip**; show the legitimate illustrative mode and explain the limitation.
5. Music should be licensed or original and quiet enough for the voiceover; burned-in captions help mobile viewing.
6. Include a few seconds showing source code (`src/core.mjs`) to demonstrate custom engineering, not just a model wrapper.
7. Review YouTube link visibility (public) and the submission rules. Do not assume uploading the project folder automatically enters the event.
