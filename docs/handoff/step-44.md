# Step 44: chapter coherence audit (report only)

Branch: `main`. Read `CLAUDE.md` first. You cannot run shell commands. Do not try. Use only file read and file write tools. Do not browse the web. Do NOT commit. Do NOT edit anything except the report file named in your prompt.

Read, in order, the chapter overview page and every lesson of the chapters in your prompt, the way a newcomer would read them start to finish. Report ONLY real problems a reader would notice:
- REPEAT: the same idea explained twice (in two lessons or two sections) without the second one building on the first.
- GAP: a lesson uses an idea, term or tool that no earlier lesson (in this or an earlier chapter) introduced, and it does not explain it.
- ORDER: something is explained after the place where it is first needed.
- DANGLING: "as we saw", "as discussed", "later we will" or a cross-reference that points to something that is not there.
- TONE: a passage whose voice clearly breaks from the rest (marketing hype, academic padding, chatty filler, second person suddenly switching to "we").
- CONTRADICTION: two places say incompatible things.
- FLOW: a section that does not follow from the one before (missing transition, abrupt topic change).

Ignore: style preferences, sentence-level wording (another pass handles that), safety content (never suggest changes to it), References lists, and anything in Chapter 3 lessons 3.1 to 3.4 except DANGLING and CONTRADICTION (those lessons are drafts Gerald will rewrite).

Format, one block per problem:
```
### <KIND>: <short title>
- Where: <lesson id>, section "<heading>" (and the second place, if any)
- Text: "<exact quote from the page text, max 40 words>"
- Why it matters: <one sentence>
- Suggested fix: <minimal>
```
Quotes must be copied exactly (a script will search for them). End with `Checked: <list of pages>`. Do not claim you verified anything.
