# Chapter 8 brief: Industrial Networks

Status: plan (October 2026). Chapter 7 reviewed and refined by Claude; Gerald to review Chapter 7 pages and this outline. Order after this: Chapter 9 maintenance and troubleshooting, Chapter 10 mobile robots and AMRs.

## Audience and scope
- First-year students and career changers. Builds on 1.7 (cell PLC, handshake signals, separate safety signals), 2.5 (controller and tool-flange digital I/O), 4.4 (cell safety) and 5.7 (IEC 61131-3 SFC, PackML). Do not repeat those; link back.
- Industrial focus: how a robot, a PLC and the plant network exchange data, how an integrator sets that up, and how a technician checks it.

## Lessons
- 8.1 From wires to networks: 24 V discrete I/O (sourcing/sinking, PNP/NPN), why fieldbuses replaced point-to-point wiring, why Ethernet replaced most fieldbuses; cyclic vs acyclic data; line, star and ring topologies.
- 8.2 Industrial Ethernet protocols: EtherNet/IP (CIP, ODVA, scanner/adapter, RPI), PROFINET (PI, controller/device, RT and IRT, GSDML), EtherCAT (ETG, processing on the fly, ESI), Modbus TCP (registers and coils); what the device description files (EDS, GSDML, ESI) do.
- 8.3 Connecting a robot to a PLC: how UR, ABB and FANUC controllers expose I/O and registers over EtherNet/IP, PROFINET and Modbus TCP; mapping the 1.7 handshake onto network signals. Lab: read and write URSim's Modbus TCP server registers from Python (pymodbus), no hardware needed.
- 8.4 Safety over the network: why standard networks cannot carry safety signals on their own; the black-channel principle; PROFIsafe, CIP Safety and FSoE (Safety over EtherCAT); link to 4.4.
- 8.5 Plant-floor to IT: OPC UA (client/server, information model, the OPC UA for Robotics companion specification), MQTT, IO-Link at the sensor level; where ROS 2 fits (bridges, not a fieldbus).
- 8.6 Network design, security and diagnostics: segmentation, managed switches and VLANs, IEC 62443 zones and conduits, jitter and update times, where TSN is heading. Lab: capture the 8.3 Modbus traffic in Wireshark and read the frames.

## Primary sources to look for
- Protocol bodies: ODVA (EtherNet/IP, CIP Safety), PI / profibus.com (PROFINET, PROFIsafe), EtherCAT Technology Group (EtherCAT, FSoE), Modbus Organization (Modbus application protocol and TCP specs, free PDFs), OPC Foundation (OPC UA, Robotics companion spec), IO-Link Consortium, MQTT (OASIS spec).
- Robot vendors: Universal Robots support articles and manuals (Modbus server register map, EtherNet/IP and PROFINET guides), ABB and FANUC application manuals where public.
- Security: ISA/IEC 62443 overviews from ISA and CISA (the standard itself is paywalled).
- Tools: pymodbus documentation, Wireshark documentation and protocol dissector pages.

## Workflow (same as Chapter 7, with what the review taught us)
1. Step 17: Gemini proposes candidate source URLs per lesson (URLs only, no quotes). Claude fetches and caches each with `scripts/fetch_text.py` and drops dead or off-topic pages.
2. Step 18: Gemini extracts facts from the cached text only; Claude checks every fact word for word against the cache (`check_facts.py`). Result: `research_notes/ch8/facts.md`.
3. Step 19: Gemini drafts one lesson per run from `facts.md`; Claude runs the number/citation guard and measures the files itself (Gemini's own counts and edit logs were wrong several times in Chapter 7).
4. Step 20: Claude reads every lesson as plain text and fixes errors, as in the Chapter 7 review.

Rules added after the Chapter 7 review:
- Never state the same fact twice to add a citation (Ch7 had 3 copies of one definition in a row).
- No "For example," sentence without an actual example.
- No intensifiers standing in for content (fundamental, severe, profound, dramatically, completely).
- Every lab must run without hardware (simulator or test publisher) and must say how to start the data source.
- Lesson cross-references must name the lesson that actually teaches the thing (Ch7 pointed to 3.4 for rclpy nodes; it is 3.6).
- Learning objectives must not promise more than the lesson covers.

## Rules (from CLAUDE.md and docs/agentic-workflow.md)
- Wikipedia-style lesson template, one h1, References list, inline `ref-N` citations numbered by first use.
- Every fact and number comes from the verified fact sheet. Nothing from memory.
- Gemini never gets shell access; quota is about 25 runs a day, so batch work into fewer, larger runs.
