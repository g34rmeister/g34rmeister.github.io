# Step 65 review: 20 new quiz questions

Line numbers are HTML line numbers of the cited lesson.

1-4 | Why is holding a load far | PASS | L334 "torque, the turning effect of a force, which grows with the distance from the joint"
1-4 | According to ROS 2 guidance in | PASS | L272 "nodes where efficiency matters “might be better implemented in C++.”" ; L261 Python "makes prototyping iterations faster"
1-7 | How should signals such as "E-stop | PASS | L365 "either hard-wired from a safety PLC or safety relays, or sent over a safety protocol such as CIP Safety or PROFIsafe"
1-7 | Why does a robot with a | PASS | L299 "the robot still needs some time to stop, and the hand keeps moving during that time"
1-7 | When is an industrial robot cell | PASS | L428 "The cell is fast enough only if its cycle time is less than or equal to takt time."
2-5 | What can happen if a robot | PASS | L289 "path accuracy suffers, and on a force-limited cobot the robot may stop for a collision that never happened"
2-5 | In a robot-to-PLC handshake, why | PASS | L525 "Every request stays on until it is acknowledged, so a slow scan cannot miss it."
4-9 | In the common three-layer driver | PASS | L251 "swapping a UR arm for a KUKA arm changes only the bottom two layers"; L292 caption
4-9 | When is programming an industrial robot | PASS | L459 "Use the vendor language when the path is fixed, cycle time and uptime matter most"
5-4 | How does a three-position enabling | PASS | L404 "manual-mode motion requires holding the enabling button in its center position. Releasing it, or squeezing it fully in a panic grip, stops the robot"
5-4 | Why are safety devices such as | REMOVE | Lesson never mentions two-channel wiring of safety inputs (only a single welded relay, L409). Deleted; ch5 header 17 -> 16.
8-4 | Why does CIP Safety use time | PASS | L274 "A time stamp also reveals delays from queuing, retries and routing."
8-4 | How does FailSafe over EtherCAT (FSoE) | PASS | L309 "The safety container in FSoE is embedded directly within cyclical communication process data."
10-1 | What is the primary role of | PASS | L256 "the robot_localization package is typically used to fuse them: it takes in N sensors of various types and provides a continuous and smooth odometry"
10-1 | Why does the robot pose in | PASS | L261 "a localization component keeps re-computing the robot pose from sensor observations, which removes drift but causes discrete jumps"
10-2 | What is the role of the | PASS | L234 "It places a decaying cost around obstacles, which makes it more costly to travel near a collision."
10-2 | Why does the behavior server subscribe | PASS | L239 "The behavior server subscribes to the local costmap instead of building its own, because costmaps are computationally expensive to duplicate."
10-3 | What is the primary function of | PASS | L234 "Smoothers typically reduce path raggedness and smooth abrupt rotations"
10-3 | Which recovery behavior helps when | PASS | L247 "If a perception fault fills the costmap with fake obstacles, a clear-costmap recovery lets the robot move again."
10-4 | Why does Nav2 use a behavior | PASS | L222 "With a tree, basic primitives can be created once and reused for many behaviors."
10-4 | What happens when a Nav2 | PASS | L243 "Configuring moves it to inactive. The on_configure() method sets up the parameters and the ROS networking interfaces."

No duplicates of existing questions found for these lessons.

## Summary
- PASS 19, FIX 0, REMOVE 1 (5-4 two-channel wiring).
- ch1 3+2 PASS; ch2 2 PASS; ch4 2 PASS; ch5 1 PASS, 1 REMOVE; ch8 2 PASS; ch10 8 PASS.
- Validation: ch1 32, ch2 26, ch4 32, ch5 16, ch8 26, ch10 19 questions; all have 4 choices and valid answer; header counts match.
- course-data.js not touched (version bump and quizCounts still needed; ch5 count is now 16).
