# Step 4 input: Chapters 4 and 6 partial refs

### 4-1:12
- Source: A. Ghanbarzadeh and E. Najafi, “Safe Physical Human-Robot Interaction through Variable Impedance Control based on ISO/TS 15066,” arXiv:2311.13814, 2023 (Table 1 reproduces the ISO/TS 15066 body-region force limits). arxiv.org/pdf/2311.13814 .
- URLs: https://arxiv.org/pdf/2311.13814
- Reviewer note: Source exists and covers TS 15066; individual values unchecked
- Cited for:
  - For each body region the specification gives a maximum permissible force for quasi-static contact; separate pressure limits (in N/cm²) are given for the specific body areas.
  - Source: ISO/TS 15066 body-region force limits as reproduced by Ghanbarzadeh and Najafi.
  - Quasi-static contact: A clamping or crushing contact, where a body part is trapped between the moving robot and a fixed object such as a table edge, fixture or wall. Because the person cannot move away, the lower limits in the table apply (for example, 140 N on the chest).

### 4-2:15
- Source: D. Nix, “Safety of Machinery: Does ISO 13849-1:2023 work for you?” presentation to the IEEE Santa Clara Valley PSES chapter, June 14, 2023. r6.ieee.org/scv-pses/wp-content/uploads/sites/17/2023/11/Safety-of-Machinery-Does-ISO-13849-1-2023-work-for-you-DNix-2023-rev2.pdf .
- URLs: https://r6.ieee.org/scv-pses/wp-content/uploads/sites/17/2023/11/Safety-of-Machinery-Does-ISO-13849-1-2023-work-for-you-DNix-2023-rev2.pdf
- Reviewer note: Cat 4 DC >99% threshold not located in text
- Cited for:
  - Dual-channel redundancy: Categories 3 and 4 use two redundant channels for each safety signal (such as an E-stop or a door interlock).
  - Diagnostics: Safety controllers test their channels and compare them. Category 4 needs diagnostic coverage above 99%.

### 4-3:3
- Source: D. Acemoglu and P. Restrepo, “Robots and Jobs: Evidence from US Labor Markets,” NBER Working Paper 23285, National Bureau of Economic Research, 2017 (working-paper version of the article above). nber.org/papers/w23285 .
- URLs: https://www.nber.org/papers/w23285
- Reviewer note: 5.6 verified; the 0.18-0.34 and 0.25-0.5 ranges are not on the page (paper PDF not opened)
- Cited for:
  - The size of the estimate changed between versions of the study. The 2017 working paper gave a range of 0.18 to 0.34 percentage points for employment and 0.25 to 0.5 percent for wages, and its summary described the arrival of one new robot in a local labor market as coinciding with an employment drop of 5.6 workers.

### 4-3:8
- Source: D. H. Autor, “Why Are There Still So Many Jobs? The History and Future of Workplace Automation,” Journal of Economic Perspectives , vol. 29, no. 3, pp. 3–30, 2015. Open-access copy, MIT DSpace: dspace.mit.edu/handle/1721.1/109476 .
- URLs: https://dspace.mit.edu/handle/1721.1/109476
- Reviewer note: PDF not opened; claims not checked against text
- Cited for:
  - A central consequence of automation so far has been labor market polarization rather than the disappearance of work. David Autor describes how, in recent decades, wage gains in the United States went disproportionately to workers at the top and the bottom of the income and skill distribution, not to those in the middle.
  - Computers substitute most easily for workers in routine, codifiable tasks, while they amplify the advantage of workers who supply problem-solving skills, adaptability and creativity. Autor also argues that this polarization is unlikely to continue very far into the future.

### 6-1:5
- Source: Universal Robots, “simulation.rst” (Usage: simulation), Universal_Robots_ROS2_Driver documentation, GitHub, accessed October 21, 2026. github.com/UniversalRobots/Universal_Robots_ROS2_Driver/blob/main/ur_robot_driver/doc/usage/simulation.rst .
- URLs: https://github.com/UniversalRobots/Universal_Robots_ROS2_Driver/blob/main/ur_robot_driver/doc/usage/simulation.rst
- Reviewer note: Supports all but the port list (30001-30004, 29999), which is in [6]; both are cited, so no text change.
- Cited for:
  - Path A: URSim in Docker (free). Universal Robots publishes one Docker image per software generation: universalrobots/ursim_polyscopex for PolyScope X, universalrobots/ursim_e-series for PolyScope 5 and universalrobots/ursim_cb3 for the older CB3 robots.
  - If you already have ROS 2 and the UR driver installed, there is also a helper, ros2 run ur_client_library start_ursim.sh -m <ur_type> -v <version> . It starts URSim on a Docker network at 192.168.56.101 with ports 30001 to 30004 and 29999 published and External Control preinstalled. Without -v it uses the latest PolyScope 5 image, and without -m it uses a UR5e.
  - There is one limit of URSim to know about. The UR ROS 2 driver documentation notes that effort control “has no effect in URSim”, so a simulated robot asked to move by effort simply stays still.
  - Control from ROS 2: start URSim with start_ursim.sh , which preinstalls the External Control URCap, and drive the robot from ROS 2.
