# Step 17: Chapter 8 (Industrial Networks) source candidates

Branch: `gemini/ch7-and-reviews`. Read `CLAUDE.md` and `plans/ch8-industrial-networks.md` first.

You are finding source pages, not facts and not lessons. Claude downloads every URL you list and saves its text; in the next step facts are taken only from those saved copies. So a good URL matters more than anything you write about it.

## Shared rules
- You have NO terminal. Calling run_command or any shell tool ends the session with no output. Use only web search, URL reading, file read and file write tools.
- Touch ONLY the output file of your task. Do NOT create lessons. Do NOT commit.
- Only list URLs you actually opened and saw load with real content. Never guess or construct a URL.
- Prefer primary and official sources listed in the brief: protocol organizations (ODVA, PI / profibus.com, EtherCAT Technology Group, Modbus Organization, OPC Foundation, IO-Link, OASIS), robot vendors' own documentation (Universal Robots, ABB, FANUC), ISA and CISA for security, pymodbus and Wireshark documentation. Free specification PDFs are good.
- No blogs, forums, Wikipedia, marketing listicles or AI summaries. Vendor technical pages and application notes are fine.
- Skip pages that need a login or are paywalled.

## Tasks (run in parallel)
- T-17a: lessons 8.1 and 8.2 → write ONLY `research_notes/ch8/step-17a.md`
- T-17b: lessons 8.3 and 8.4 → write ONLY `research_notes/ch8/step-17b.md`
- T-17c: lessons 8.5 and 8.6 → write ONLY `research_notes/ch8/step-17c.md`

For each lesson, list 8 to 12 pages that together cover the lesson's topics in the brief. One line per page:

`<lesson> | <URL> | <publisher> | <which lesson topics the page explains, in a few words>`

- At least 3 different publishers per lesson.
- For 8.3, include Universal Robots pages on its Modbus TCP server (register map) and on EtherNet/IP or PROFINET, plus the pymodbus client documentation.
- For 8.6, include Wireshark documentation for capturing traffic and for the Modbus/TCP dissector.

Finish with a summary of at most 4 lines: file changed, pages per lesson, publishers used. Do not paste file contents.
