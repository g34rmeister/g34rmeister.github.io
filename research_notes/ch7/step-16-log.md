# Step 16 Citation and Length Audit Log

## Added Citations
7-6 | ref 7 | https://docs.opencv.org/4.x/df/d9d/tutorial_py_colorspaces.html | OpenCV converts color images using cv.cvtColor with flags such as cv.COLOR_BGR2GRAY for grayscale and cv.COLOR_BGR2HSV for hue-saturation-value representation.
7-6 | ref 8 | https://docs.opencv.org/4.x/d7/d4d/tutorial_py_thresholding.html | In simple thresholding with cv.threshold and cv.THRESH_BINARY, pixels smaller than or equal to the threshold are set to 0 while all others are set to a maximum value.
7-6 | ref 8 | https://docs.opencv.org/4.x/d7/d4d/tutorial_py_thresholding.html | Adaptive thresholding calculates distinct local threshold values for small regions across an image to handle scenes with non-uniform illumination.
7-6 | ref 8 | https://docs.opencv.org/4.x/d7/d4d/tutorial_py_thresholding.html | Otsu binarization determines an optimal global threshold automatically from a bimodal image histogram using the cv.THRESH_OTSU flag.
7-6 | ref 9 | https://docs.opencv.org/4.x/da/d22/tutorial_py_canny.html | The initial step of the Canny edge detector removes image noise using a 5x5 Gaussian smoothing filter.
7-6 | ref 9 | https://docs.opencv.org/4.x/da/d22/tutorial_py_canny.html | In cv.Canny, the aperture_size parameter configures the Sobel kernel size for computing image gradients and defaults to 3.
7-6 | ref 9 | https://docs.opencv.org/4.x/da/d22/tutorial_py_canny.html | Non-maximum suppression suppresses pixels that are not local intensity maxima along the gradient direction to produce thin single-pixel edges.

## Cut or Softened Sentences
7-1 | cut | An industrial camera is a measurement instrument, not a photographic device designed
7-1 | cut | The sensor is a solid-state silicon chip patterned with a two-dimensional matrix
7-1 | cut | When photons enter a pixel, they generate electron-hole pairs in a
7-1 | cut | The pixel accumulates this charge during an exposure interval, producing an electrical
7-1 | cut | For decades, machine vision relied on charge-coupled devices (CCD).
7-1 | cut | In a CCD sensor, electrical charge packets accumulated at photosites are shifted
7-1 | cut | Today, industrial imaging is dominated by Complementary Metal Oxide Semiconductor (CMOS) sensors.
7-1 | cut | In a CMOS imager, every pixel possesses its own charge-to-voltage conversion circuit
7-1 | cut | The sensor multiplexes signals by row and column directly into on-chip analog-to-digital
7-1 | cut | Because a larger physical photosite collects a greater quantity of incident photons
7-1 | cut | When pixel wells sit immediately adjacent to one another with minimal spacing,
7-1 | cut | This optical and electrical crosstalk softens fine transitions, degrading image contrast where
7-1 | cut | If the spatial frequency of the object exceeds the sensor's Nyquist limit,
7-1 | cut | As spatial frequency approaches the sensor's Nyquist limit, optical aberrations and pixel
7-1 | cut | After exposure ends simultaneously for all pixels, the accumulated charges are transferred
7-1 | cut | Rolling shutter pixels require fewer transistors because they do not require separate
7-1 | cut | For stationary inspection tasks where neither the camera nor the inspected component
7-1 | cut | Consequently, vertical lines lean sideways into slanted parallelograms, rectangular parts shear into
7-1 | cut | If ambient light is kept low and an intense LED strobe flash
7-1 | cut | A bare image sensor cannot form an image on its own; without
7-1 | cut | Measured in millimeters, focal length specifies the distance from the lens's rear
7-1 | cut | Standard fixed focal length lenses are entocentric: they collect light rays across
7-1 | cut | While entocentric lenses mimic human vision, their angular geometry introduces severe errors
7-1 | cut | The camera sees the side walls of deep holes rather than looking
7-1 | cut | In an object-space telecentric lens, an internal optical aperture stop is positioned
7-1 | cut | This configuration forces the optical system to accept only chief rays that
7-1 | cut | When a part feature moves slightly out of focus in an entocentric
7-1 | cut | While telecentric lenses are physically large—their front optical element must be at
7-1 | cut | Industrial machine vision utilizes standardized physical transport layers engineered for deterministic transmission.
7-1 | cut | Two of the most common interfaces are GigE Vision and USB3 Vision.
7-1 | cut | GigE Vision transmits packetized image data over standard Gigabit Ethernet cabling.
7-1 | cut | USB3 Vision provides high bandwidth over shorter distances, offering convenient plug-and-play operation
7-1 | cut | GenICam achieves universality by requiring every compliant camera to host an on-board
7-1 | cut | This XML file adheres to the Standard Features Naming Convention (SFNC), which
7-1 | cut | When a host software program—such as a ROS 2 camera driver or
7-1 | cut | The host software reads available parameters and configures features through standardized function
7-1 | soften | By dividing the total pixel count along a sensor axis by the
7-1 | soften | When an eye-in-hand camera mounted on a robot wrist takes a snapshot
7-1 | soften | If an object moves horizontally across the field of view while rows
7-1 | soften | For a given sensor format, increasing the working distance enlarges the field
7-1 | soften | Short focal length, wide-angle lenses frequently exhibit barrel distortion, causing straight rectangular
7-1 | soften | Long focal length lenses tend toward pincushion distortion, pulling corners outward.
7-1 | soften | Each full stop increases the f-number by approximately 1.414 (the square root
7-1 | soften | When an engineer stops down a lens to a higher f-number (for
7-1 | soften | To maintain proper pixel exposure at f/8, the vision system must either
7-1 | soften | If a robotic gripper picks parts from a stack where height varies
7-1 | soften | When an entocentric lens views cylindrical holes or vertical pins near the
7-1 | soften | A 20 mm shaft keeps the same image size whether it sits
7-2 | cut | Early industrial vision systems relied on incandescent lamps, halogen spots, or fluorescent
7-2 | cut | In addition to long lifespan, LEDs provide low thermal output, consistent spectral
7-2 | cut | By surrounding the lens with an array of LEDs, light strikes the
7-2 | cut | Furthermore, as working distance increases, ring light rays become increasingly directional
7-2 | cut | Light reflects directly into the camera lens only at points where the
7-2 | cut | Everywhere else, light reflects away from the lens, creating deep, dark shadows.
7-2 | cut | The resulting image exhibits extreme dynamic range that blinds image sensors and
7-2 | cut | A dome light consists of a hollow hemispherical dome with a diffuse
7-2 | cut | An LED ring mounted along the lower perimeter shines light upward into
7-2 | cut | The camera views the inspected part through a small observation aperture at
7-2 | cut | When light strikes a mirror-like flat surface at an angle, the law
7-2 | cut | Rather than attaching an external beamsplitter box in front of the lens,
7-2 | cut | Because a telecentric lens accepts only rays that are parallel to the
7-2 | cut | Doping introduces absorbing ions throughout the glass substrate during manufacture, producing filters
7-2 | cut | Without an infrared cut-off filter, ambient heat and infrared emissions from factory
7-2 | cut | When sharp spectral cutoff transitions are required, coated interference filters are used
7-2 | cut | Interference filters use alternating dielectric layers to create constructive and destructive wave
7-2 | cut | Continuous high-intensity lights generate substantial heat, consume excess power, degrade LED life,
7-2 | cut | Furthermore, continuous lighting limits the ability to freeze fast part motion on
7-2 | soften | An expensive high-resolution camera paired with a precision lens will still produce
7-2 | soften | When light intensity varies across a conveyor belt or part fixture, an
7-2 | soften | If an overhead light source casts an asymmetric shadow along the edge
7-2 | soften | In robotic pick-and-place, this false edge calculation shifts the calculated grasping coordinate
7-2 | soften | Backlighting is the preferred choice for dimensional gauging of stamped sheet metal
7-2 | soften | When inspecting clear glass vials or plastic bottles, backlighting is also used
7-2 | soften | Machined metal cylinders, chrome ball bearings, polished automotive fasteners, aluminum soda cans,
7-2 | soften | Microscopic wire bonds, metallic interconnect traces, and silicon wafer defects stand out
7-2 | soften | Overhead sodium vapor fixtures, fluorescent tubes, high-bay LEDs, and sunlight from skylights
7-2 | soften | To make a feature appear bright in a monochrome image, illuminate it
7-2 | soften | To make a feature appear dark, illuminate it with light from the
7-2 | soften | If an interference filter is attached to a wide-angle lens with a
7-2 | soften | Short exposure times freeze rapid part motion on moving conveyors, eliminating motion
7-3 | cut | The function computes the cumulative distribution function of the grayscale histogram and
7-3 | cut | Otsu binarization mathematically calculates the threshold value that minimizes intra-class intensity variance,
7-3 | soften | The function cv.minMaxLoc scans the output matrix to find the global minimum
7-4 | cut | Starting from an arbitrary seed point, the algorithm queries neighboring points within
7-5 | cut | Diffraction and optical aberrations cause light from adjacent white bars to bleed
7-5 | cut | A telecentric lens features an optical design where the chief rays are
7-5 | cut | Unlike spherical aberration or chromatic aberration, which degrade contrast and blur fine
7-5 | cut | Optical verifiers analyze calibrated parameters including symbol contrast, modulation, reflectivity, and axial
7-6 | soften | Because of GenICam, a ROS 2 driver node can discover features, adjust
7-6 | soften | A single 1080p uncompressed color stream at 30 frames per second generates

## Summary
robotics-7-1.html: 24 cited, 48 kept, 36 cut (12 softened); 1,120 words.
robotics-7-2.html: 27 cited, 52 kept, 19 cut (13 softened); 1,180 words.
robotics-7-3.html: 23 cited, 50 kept, 2 cut (1 softened); 1,390 words.
robotics-7-4.html: 18 cited, 41 kept, 1 cut (0 softened); 1,340 words.
robotics-7-5.html: 30 cited, 36 kept, 4 cut (0 softened); 1,290 words.
robotics-7-6.html: 24 cited (7 added), 54 kept, 0 cut (2 softened); 1,980 words.
