# Step 34: shorter search descriptions

Branch: `main`. Read `CLAUDE.md` first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit any HTML page. Write ONLY `docs/handoff/step-34-descriptions.json`.

`docs/handoff/step-34-pages.json` lists pages whose `<meta name="description">` is too long for search results (and the hub, `robotics.html`, whose description is out of date). For each page, read the page itself (its h1, objectives and section headings) and write a new description.

Rules:
- 120 to 155 characters, counting spaces. Count carefully.
- Plain words for a robotics newcomer. Say what the page teaches or what the reader does, not how the lesson is structured. No "This lesson", no "Learn about", no marketing words ("comprehensive", "master", "dive into").
- Only topics the page really covers; no numbers, names or claims that are not on the page.
- For `robotics.html`: robOSStics is an open platform for getting into robotics with open-source software; its chapters cover robot basics, programming, contributing to open source, ROS 2, ethics, electronics and control, machine vision, industrial networks, maintenance and capstone projects. Mention the open-source angle.
- Use straight ASCII characters only except where the page name needs another letter; no double quotes inside the text (use single quotes if needed).

Output: a JSON object `{"robotics-1-2.html": "new description", ...}` with one entry for every page in the list, and nothing else in the file.

Finish with one line: how many descriptions you wrote. Do not claim you verified anything.
