# Step 38: Widget Proposals (Lessons 6-1 through 10-4)

### 6-1: ultrasonic-distance
- Shows: Calculates obstacle distance from HC-SR04 echo travel time in dry air at 20 °C.
- Reader can: Change echo pulse duration in microseconds to calculate distance in centimeters.
- Lesson text it uses: "Because the pulse travels to the obstacle and back, the distance is half of speed times echo time." / "To take a measurement, the microcontroller sends a 10-microsecond pulse on the Trigger pin; the module then sends eight cycles of 40 kHz ultrasound and holds its Echo pin HIGH for the time the sound takes to travel out and back."
- Placement: after the paragraph starting "In dry air at 20 &deg;C, sound travels"
- Value (1-3): 2

### 6-5: gyro-drift
- Shows: Calculates accumulated heading drift over time caused by integrated gyroscope zero-rate bias offset.
- Reader can: Adjust gyroscope bias offset in °/s and elapsed running time in seconds to see resulting angular heading error.
- Lesson text it uses: "its small bias is integrated along with the rotation rate, so the error keeps growing" / "In the lesson's example, after 100 seconds a bias of \(0.3^\circ/\text{s}\) produces a 30-degree heading error."
- Placement: after the paragraph starting "In the lesson's example, after 100 seconds a"
- Value (1-3): 2

### 6-10: jacobian-singularity
- Shows: Calculates the 2R planar arm Jacobian determinant and joint speeds for a radial tool velocity near singularity.
- Reader can: Adjust elbow angle theta2 from 180° down to 0° to observe det J dropping to zero and joint speeds growing like 1/theta2.
- Lesson text it uses: "Near a singularity the arm can still move radially, but only with very fast joints." / "det J = 0 exactly when the arm is fully stretched or fully folded."
- Placement: after the paragraph starting "Near a singularity the arm can still move"
- Value (1-3): 2

### 7-1: f-number-aperture
- Shows: Calculates effective aperture diameter and relative optical light throughput across standard f-number stops.
- Reader can: Select standard f-numbers from f/1.4 to f/16 to see how aperture area and light throughput halve with each stop.
- Lesson text it uses: "The f-number of a lens is fundamentally defined as the ratio of its focal length to the effective aperture diameter." / "Increasing the f-number by a factor of the square root of two halves the aperture area and reduces lens light throughput by a factor of two."
- Placement: after the paragraph starting "The mathematical relationship between aperture diameter, area, and"
- Value (1-3): 2

### 7-2: cross-polarization
- Shows: Rejection of specular glare versus diffuse reflection as the angle between the illumination polarizer and lens analyzer varies.
- Reader can: Rotate the analyzer filter angle from 0° to 90° relative to the illumination polarizer to see specular glare extinguish while diffuse light passes through.
- Lesson text it uses: "Cross-polarization uses a polarizer on the illumination source and an analyzer on the camera lens oriented at 90 degrees to achieve maximum rejection of unwanted glare." / "In contrast, light that penetrates the part surface and scatters diffusely is depolarized, allowing a portion of it to pass through the analyzer to form a clear, glare-free image."
- Placement: after the paragraph starting "To remove intense glare from semi-specular parts without"
- Value (1-3): 2

### 7-4: stereo-disparity
- Shows: Calculates stereo disparity from physical baseline, lens focal length, and object depth.
- Reader can: Adjust camera baseline, focal length, or object depth sliders to see the resulting pixel disparity and triangulation geometry.
- Lesson text it uses: "In stereo vision triangulation, depth Z is inversely proportional to disparity according to the relationship disparity equals baseline B times focal length f divided by depth Z." / "When a part is situated very close to the stereo camera, the horizontal shift between the two camera views is large, resulting in a large disparity value."
- Placement: after the paragraph starting "Disparity and depth are linked by simple geometry."
- Value (1-3): 3

### 7-5: presence-area-check
- Shows: Classifies part presence and integrity by comparing connected-component pixel area CC_STAT_AREA against pass/fail limits.
- Reader can: Adjust min and max area thresholds and test candidate part pixel areas to classify them as pass, torn/missing, or oversize.
- Lesson text it uses: "The CC_STAT_AREA statistic output in OpenCV connected components represents the total area in pixels of the labeled component." / "If a required gasket has an expected area of 4,500 pixels, an observed component with an area under 3,000 pixels indicates a torn or missing gasket, triggering an immediate robot reject routine."
- Placement: after the paragraph starting "The CC_STAT_AREA statistic output in OpenCV connected"
- Value (1-3): 2

### 7-6: pinhole-projection
- Shows: Projects a 3D camera frame coordinate (X, Y, Z) to 2D pixel coordinates (u, v) using intrinsic matrix K.
- Reader can: Adjust 3D point position (X, Y, Z) or focal lengths (fx, fy) to observe normalized coordinates and projected pixel coordinates (u, v).
- Lesson text it uses: "The 3x3 intrinsic camera matrix K projects 3D camera frame coordinates to 2D pixel coordinates using focal lengths and principal point offsets." / "The geometric mapping between 3D camera coordinates and 2D pixel coordinates is parameterized by three distinct matrix structures:"
- Placement: after the paragraph starting "For example, imagine a calibrated monocular camera whose"
- Value (1-3): 3

### 8-1: dlr-ring-recovery
- Shows: Device Level Ring supervisor behavior unblocking its alternate port when a link break interrupts beacon frames.
- Reader can: Click to break a ring cable segment to see beacon loss and automatic unblocking restoring network path within 2890 µs.
- Lesson text it uses: "The active ring supervisor transmits beacon frames through both of its ring ports to monitor network health." / "During normal operation, one of the supervisor's ring ports is blocked, so the ring behaves like a line with no loop." / "The supervisor then unblocks its blocked port so traffic can reach every node through the remaining path."
- Placement: after the paragraph starting "During normal operation, one of the supervisor's ring"
- Value (1-3): 3

### 8-2: ethernet-ip-messaging
- Shows: Compares EtherNet/IP Implicit (cyclic UDP I/O) versus Explicit (acyclic TCP client-server) messaging modes and packet structures.
- Reader can: Toggle between Implicit and Explicit messaging to compare transport protocols, header overhead, and data payload handling.
- Lesson text it uses: "Implicit messages in EtherNet/IP are time-critical connected communications that transport I/O data using UDP without embedded protocol headers." / "Explicit messages in EtherNet/IP use TCP for request-reply client-server transactions addressed to the Message Router object."
- Placement: after the paragraph starting "Explicit messages in EtherNet/IP use TCP for"
- Value (1-3): 2

8-4 | none | Safety lesson (safety networks and safety functions are excluded by rule).
8-5 | none | Protocol architectures are descriptive, and QoS comparison is already implemented in the lesson 4.5 qos widget.
9-1 | none | Maintenance procedures and checklists are text-based without interactive models, and the strategy comparison is already in the static diagram.
9-2 | none | Lockout/tagout is excluded by rule, and troubleshooting guidelines are procedural text without interactive models.
9-3 | none | Protective stop recovery is excluded by rule, and collision decision logic is already shown in the static diagram.
9-4 | none | Multimeter procedures and troubleshooting rules are diagnostic guidance without an interactive model.
9-5 | none | Calibration sequence is already shown in the static diagram, and backup procedures are static file operations.
10-1 | none | Project brief synthesizing cell design and safety configuration without a standalone interactive model.
10-2 | none | The MoveIt Task Constructor stage sequence is already shown in the static diagram, and project briefs are procedural without an interactive model.
10-3 | none | The supervisory state machine is already in the static diagram, and underlying PID/encoder/PWM models exist in chapter 6 widgets.
10-4 | none | Capstone project brief synthesizing earlier topics with an architecture diagram already present and dashboard widget existing in lesson 9.6.

Checked lessons: 6-1 6-5 6-10 7-1 7-2 7-4 7-5 7-6 8-1 8-2 8-4 8-5 9-1 9-2 9-3 9-4 9-5 10-1 10-2 10-3 10-4
