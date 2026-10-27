# Chapter 7 brief: Machine Vision

Status: outline, research step (step 11). Gerald approved the topic (machine vision first; then industrial networks, maintenance and troubleshooting, mobile robots and AMRs). Stop after Chapter 7 for Gerald's review before Chapter 8.

## Audience and scope
- First-year students and career changers. Builds on 2.8 (Vision-Guided Picking: 2D/2.5D/3D guidance, eye-in-hand vs eye-to-hand, intrinsic and hand-eye calibration). Do not repeat 2.8; link back to it.
- Industrial focus: what a vision engineer on a robot cell chooses, sets up and checks.

## Lessons
- 7.1 Industrial cameras and optics: CMOS sensors, global vs rolling shutter, resolution and pixel size, lenses (focal length, working distance, field of view, depth of field, f-number), machine-vision interfaces (GigE Vision, USB3 Vision, GenICam).
- 7.2 Lighting: why lighting comes first; back light, ring light, diffuse dome, dark-field, coaxial, structured light; wavelength choice and filters; strobing.
- 7.3 Image processing basics: grayscale and histograms, thresholding, blob analysis, edge detection, template/pattern matching; each with an OpenCV function.
- 7.4 3D sensing: stereo, structured light, time-of-flight, laser triangulation (line scanners); point clouds and what they are used for in picking.
- 7.5 Inspection and measurement: gauging and pixels per mm, measurement accuracy vs resolution, presence and defect checks, barcodes and OCR; where learned (deep-learning) vision fits (link 4.5).
- 7.6 Lab: a ROS 2 camera pipeline (camera driver, `sensor_msgs/Image`, `CameraInfo`, `image_transport`, `cv_bridge`, a simple OpenCV node).

## Rules (from CLAUDE.md and docs/agentic-workflow.md)
- Wikipedia-style lesson template, one h1, References list, inline `ref-N` citations numbered by first use.
- Every fact and number comes from the verified fact sheet `research_notes/ch7/facts.md` (built by Claude in step 11). Nothing from memory.
- Primary sources: standards bodies (EMVA for GigE Vision/GenICam, AIA/A3), vendor documentation and application notes (Basler, Teledyne, Cognex, Keyence, Edmund Optics, Sony sensors), OpenCV and ROS 2 documentation, textbooks with official pages.
