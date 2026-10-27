# Step 16 Citation and Length Audit Log: Lesson 7.3

## Added Citations
7-3 | ref 5 | https://www.edmundoptics.com/knowledge-center/application-notes/illumination/choose-the-correct-illumination/ | Desired image quality can typically be achieved by improving system illumination rather than investing in higher resolution detectors or lenses.

## Cut or Softened Sentences
7-3 | cut | Raw digital cameras typically deliver color images arranged in blue, green, and red
7-3 | cut | While color is useful for human inspection, multi-channel images contain redundant brightness
7-3 | soften | Converting to grayscale reduces image data to a single channel representing light intensity
7-3 | cut | In the RGB color model, brightness and chromaticity are intertwined across all
7-3 | cut | In contrast, HSV separates color hue from saturation and overall illumination value.
7-3 | cut | This explicit division allows vision software to track colored parts reliably even
7-3 | soften | When an image array element falls within the prescribed boundary arrays, the
7-3 | cut | This creates a binary mask where the part of interest is separated
7-3 | soften | For standard 8-bit grayscale images, each pixel holds an integer value between
7-3 | cut | A histogram with 256 bins counts how many pixels exhibit each brightness
7-3 | cut | Examining this distribution indicates whether an image is under-exposed, over-exposed, or properly
7-3 | soften | When the intensity difference between the darkest and brightest regions is small,
7-3 | cut | High contrast creates steep intensity transitions between adjacent pixels, enabling downstream algorithms
7-3 | cut | This operation spreads clustered middle-gray tones into distinct lighter and darker values,
7-3 | soften | If illumination is poorly distributed across the robot cell, portions of a
7-3 | cut | While software equalization redistributes existing pixel levels, it cannot recreate lost optical
7-3 | soften | While simple thresholding works well in tightly controlled light boxes, factory floors
7-3 | cut | Under a lighting gradient, a single fixed global threshold causes one side
7-3 | cut | Instead of evaluating every pixel against a fixed global number, the algorithm
7-3 | soften | A bimodal histogram exhibits two distinct peaks—one representing the dark foreground and
7-3 | soften | Engineers use this statistic to filter out dust flecks and small reflection
7-3 | soften | If an image contains dark parts against a white background, the image
7-3 | soften | For example, instead of storing hundreds of individual boundary pixels along a
7-3 | cut | Here, M00 represents the contour area, while M10 and M01 represent
7-3 | soften | The resulting coordinates (Cx, Cy) specify the exact planar centroid of the
7-3 | cut | By converting the grayscale source into multiple binary slices, the detector ensures
7-3 | soften | This clustering step consolidates overlapping detections from adjacent threshold passes into a
7-3 | cut | When an object has rough or elongated edges, its perimeter grows relative
7-3 | soften | Setting minimum and maximum circularity bounds allows vision systems to sort round
7-3 | cut | Convolving the raw image with this Gaussian kernel attenuates pixel noise before
7-3 | cut | The gradient magnitude and angle indicate how rapidly image intensity changes and
7-3 | cut | At each pixel, the algorithm checks whether the gradient magnitude is
7-3 | cut | Pixels with gradient magnitudes exceeding maxVal are confirmed as sure edges.
7-3 | cut | Pixels falling below minVal are discarded.
7-3 | cut | Pixels in between are retained only if they link directly to a
7-3 | cut | Depending on the comparison metric chosen—such as normalized cross-correlation or squared difference—the

## Summary
robotics-7-3.html: 26 cited (1 added), 42 kept, 23 cut (13 softened); 1,025 lesson words (2,330 total file words).
