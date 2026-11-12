# Step 61: add "classes and callbacks" to lesson 4.4 (closed world, one subsection)

Branch: `writing-polish-3`. Read `CLAUDE.md` first. You cannot run shell commands. Do not browse the web. Do NOT commit. You may edit ONLY `robotics-4-4.html`, and only as described here. Write ONLY one new file, `docs/handoff/step-61-data.json`.

## Why
A course review found a jump: lesson 1.4 says a centimeters-to-inches program is enough programming to start, but section "08. Writing a custom rclpy velocity publisher" of lesson 4.4 suddenly uses a Python class, `__init__`, `self`, inheritance from `Node`, and a timer callback. Newcomers who have only written short scripts get lost there.

## What to add
Insert ONE subsection at the very start of section 08, directly after its `<h2>` heading and before the existing first paragraph. Do not change, move or delete any existing text, code, figure, citation or reference. Do not renumber sections.

- Heading: `<h3>Before you write the node: classes and callbacks in Python</h3>` (copy the h3 markup pattern used elsewhere in this page or in `robotics-4-6.html` if this page has none).
- 250 to 450 words of prose plus the code, no more than that for this subsection, because it is a detour.
- Explain in this order, each in plain words: what a class is and what an object (instance) is; what `__init__` does; what `self` is; what inheritance means in one sentence ("class MinimalPublisher(Node)" makes a node that already knows how to do everything a Node does); what a callback is (a function you hand to something else, which calls it later; you pass the name without parentheses).
- Then the demo `research_notes/contrib-bridge/lab/callback_demo.py`, verbatim, and its output from `research_notes/contrib-bridge/callback-demo-transcript.md`, verbatim. Say it runs with plain Python, no ROS 2 needed.
- Then two or three sentences mapping the demo to the node the reader is about to write: `run_timer` stands in for the ROS 2 timer, `on_tick` for the timer callback, the counter for the node's own data. Use the names that the existing section 08 code actually uses (read it first).
- End with one sentence pointing to The Python Tutorial, chapter 9 "Classes", for readers who want more.

## Sources (closed world)
- `research_notes/contrib-bridge/sources/python-tutorial-classes.txt`: Python Software Foundation, &ldquo;9. Classes,&rdquo; The Python Tutorial. https://docs.python.org/3/tutorial/classes.html . Add it to the References list as a new `<li id="ref-N">` with the next free number, in the same format as the other entries.
- `research_notes/contrib-bridge/sources/Py-Publisher-And-Subscriber.rst`: this is the page's existing reference "Writing a simple publisher and subscriber (Python), ROS 2 Documentation: Lyrical". Cite the existing reference number for it. Do not add it twice.
Every statement about Python or rclpy behaviour carries a citation to one of these two. Statements about the demo itself need none. Nothing from memory. If unsure, leave it out.

Writing rules: short sentences, everyday words, no em dashes, no semicolons in prose, American spelling, no "simply" or "just". Escape `<`, `>`, `&` in code.

## `docs/handoff/step-61-data.json`
`{"claims": [{"ref": N, "file": "python-tutorial-classes.txt", "claim": "the lesson sentence", "quote": "verbatim text from that source file, 6 to 40 words"}, ...]}` with one entry per citation you added. A script searches the file for every quote.

Finish with a summary of at most 10 lines: files changed, anything unresolved, any deviation. Do not paste file contents.
