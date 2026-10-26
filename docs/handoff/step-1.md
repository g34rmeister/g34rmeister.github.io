# Step 1: candidate sources for dead reference links

Branch: `gemini/step-1-dead-links`. Read `CLAUDE.md` first.

## Shared rules
- You cannot run shell commands in this environment. Do not try (no python, no curl). Use your built-in web search tool and your file write tool only.
- Touch ONLY the file listed in your task. Do NOT commit.
- You are proposing candidates, not verifying them. Claude fetches every URL and checks it. Do NOT write quotes and do NOT mark anything "fetched" or "verified".
- Never invent a URL. Only list URLs that appeared in your search results. A wrong guess wastes a check; an invented URL fails the ticket.
- Prefer primary and official sources: UN/UNODA and UN documents, Nabtesco, ISO or robot-metrology vendors, the Arduino GitHub repo, the authors' or Willow Garage/Stanford pages. web.archive.org copies of the old URL count. No blogs or AI summaries.

## T-1a: write ONLY `research_notes/dead-links/step-1.md`
For each ref below, list 2 to 4 candidate URLs, best first. Use exactly one line per candidate, in this format and nothing else (no prose, no headings except `## <ref>`):

`<ref id> | <URL> | same-doc or substitute | <claim letters it should support> | <2 to 4 distinctive words or numbers to grep for, comma-separated>`

Example: `1-6:9 | https://example.org/rv.pdf | same-doc | a,b,c | 65.4, arc.min, 1985`

1. **4-2:22** UNODA, "Background on Lethal Autonomous Weapons Systems in the CCW". Old URL: https://disarmament.unoda.org/the-convention-on-certain-conventional-weapons/background-on-laws-in-the-ccw/
   a) states discuss LAWS in the CCW and there is no commonly agreed definition; b) in 2023 the UN Secretary-General recommended states conclude by 2026 a legally binding instrument prohibiting LAWS that function without human control or oversight.
2. **1-6:9** Nabtesco "Precision Reduction Gear RV: RS series" catalog. Old URL: https://en.nabtesco.de/fileadmin/05_downloads/03_kataloge/RS-series_EN.pdf
   a) RV gear introduced in 1985 and used by most major industrial robot makers; b) RS series backlash 1.0 to 1.5 arc-minutes; c) gear ratios 65.4 to 240.
3. **1-6:11** Hexagon "ISO 9283 Basics" PDF. Old URL: https://documentation-be.hexagon.com/bundle/04_ISO9283_Basics/raw/resource/enus/04_ISO9283_Basics.pdf
   a) pose accuracy AP = distance from commanded pose to mean attained pose; b) pose repeatability RP = mean distance from the barycentre plus three standard deviations; c) test at rated load, five points in a test cube, 30 cycles.
4. **5-1:14 and 5-2:12** (same source) Arduino Servo library. Old URL: https://github.com/arduino-libraries/Servo
   a) use a separate supply for servos and connect the grounds; b) write() maps 0-180 degrees to a default 544-2400 us pulse, initial 1500 us, 20 ms refresh, writeMicroseconds() sets the pulse; c) on non-Mega boards the library disables analogWrite() on pins 9 and 10; d) on ATmega328P it uses 16-bit Timer1. Give file-level URLs on the default branch (README, docs, `src/Servo.h`, `src/avr/ServoTimers.h`, `src/avr/Servo.cpp`) rather than the repo root.
5. **2-4:1** Quigley et al., "ROS: an open-source Robot Operating System", ICRA Workshop on Open Source Software, 2009. Old URL (dead copy): https://project.dke.maastrichtuniversity.nl/swarmlab_old/wp-content/uploads/2012/07/quigley-icra2009-ros-1.pdf
   Find live full-text PDFs. a) "is not an operating system in the traditional sense of process management and scheduling"; b) nodes find each other through a master and negotiate connections over XML-RPC; c) rviz among the original tools.

Finish with a summary of at most 5 lines: file changed, refs with fewer than 2 candidates. Do not paste file contents.
