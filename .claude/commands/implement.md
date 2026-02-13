# Implement Feature: $ARGUMENTS

Implement the feature described in the implementation plan for ticket `$ARGUMENTS` using a quality-gated engineer → reviewer cycle.

---

## Step 1: Load the Plan

Find the implementation plan at `.claude/plans/$ARGUMENTS-implementation.md`.

- If the file does not exist, stop immediately and tell the user:
  > No implementation plan found for `$ARGUMENTS`. Run `/plan $ARGUMENTS` first to generate one.

Read the plan in full before proceeding. Pay particular attention to:
- The suggested branch name in the plan frontmatter (`**Branch**: ...`)
- The ordered implementation steps (§3)
- The test plan: unit, accessibility, and security tests (§4)
- The Definition of Done (§5)
- Any open questions (§6) — if any are marked as blocking, ask the user to resolve them before continuing

---

## Step 2: Create Branch

Extract the branch name from the plan's `**Branch**:` field. If the field is missing or empty, derive it from the ticket ID and title using the format `feature/$ARGUMENTS-<kebab-case-title>` (e.g. `feature/KAN-42-user-profile-redesign`), truncating the description at 5 words maximum.

Then run:

```bash
git checkout main && git pull origin main && git checkout -b <branch-name>
```

- If the branch already exists, check it out with `git checkout <branch-name>` and confirm with the user before continuing — they may have already started work on it.
- Tell the user the branch name before proceeding.

---

## Step 3: Implement

Use the **Task tool** to launch the `principal-frontend-engineer` agent with the following prompt:

```
Implement the feature described in the plan below. Work through each implementation step in order. Write tests as you go — do not leave them until the end.

When you are done with the full implementation (all steps, all tests):
1. Run `npm run type-check` (or `pnpm run type-check` if the repo uses pnpm)
2. Run `npm run lint` (or `pnpm run lint`)
3. Run `npm test` (or `pnpm test`)

Fix any failures before finishing. Only report back when all three commands exit cleanly.

Do not open a PR. Do not commit. Just implement and verify locally.

--- PLAN ---
[paste the full contents of the plan file here]
```

Wait for the agent to complete. Capture:
- A summary of what was implemented
- The list of files changed
- Confirmation that type-check, lint, and tests all passed

If the agent reports that tests are failing and it cannot fix them, stop the cycle and report the failure to the user with details of what broke.

---

## Step 4: Verify

Before handing off to the reviewer, run the verification suite yourself to confirm the engineer's report:

```bash
npm run type-check && npm run lint && npm test
```

(Substitute `pnpm` if the project uses pnpm.)

- If any command fails, go back to Step 2 — launch the engineer agent again, passing it the failure output and asking it to fix the failures. Treat this as iteration 1 of the fix cycle.
- Only proceed to Step 4 once all three commands exit 0.

---

## Step 5: Code Review

Use the **Task tool** to launch the `principal-code-reviewer` agent with the following prompt:

```
Review the implementation of [TICKET-ID] against its plan. Focus only on the changed code (use `git diff main` or `git diff origin/main` to scope the review).

Context:
- Ticket: [TICKET-ID]
- Plan: .claude/plans/[TICKET-ID]-implementation.md

Review criteria (in addition to your standard process):
1. Does the implementation satisfy every acceptance criterion in the plan?
2. Are the unit tests adequate — do they cover happy paths, edge cases, and error states?
3. Are the accessibility requirements met (see §4.2 of the plan)?
4. Are the security requirements met (see §4.3 of the plan)?
5. Does the code follow the existing patterns in the codebase?

Use your standard feedback format (🔴 Critical, 🟡 Important, 🟢 Suggestions, ✅ What's Done Well).

At the very end of your review, output one of these exact lines so the result can be parsed:
  REVIEW_RESULT: APPROVED
  REVIEW_RESULT: CHANGES_REQUIRED
```

---

## Step 6: Evaluate Review

Parse the reviewer's output:

- If it ends with `REVIEW_RESULT: APPROVED` → proceed to Step 7 (Done).
- If it ends with `REVIEW_RESULT: CHANGES_REQUIRED` → continue to Step 6a.

### Step 6a: Fix Cycle

**Maximum fix cycles: 3.** Track how many times you have been through this loop. If you reach 3 cycles without approval, stop and report to the user:

> The implementation did not pass code review after 3 fix cycles. Manual intervention is required. The last review findings are shown above.

If within the limit, launch the `principal-frontend-engineer` agent again with:

```
The code review for [TICKET-ID] found issues that must be addressed. Apply ALL 🔴 Critical and 🟡 Important fixes from the review below. Do not change anything unrelated to the review findings.

When done:
1. Run `npm run type-check`
2. Run `npm run lint`
3. Run `npm test`

Fix any failures before finishing. Report back only when all three pass.

--- REVIEW FINDINGS ---
[paste the 🔴 Critical and 🟡 Important sections from the review]

--- PLAN (for reference) ---
[paste the full plan]
```

After the engineer completes fixes, re-run verification (Step 4), then return to Step 5 for another review pass.

---

## Step 7: Done

When the reviewer outputs `REVIEW_RESULT: APPROVED`, output a final summary to the user:

```
## Implementation Complete: [TICKET-ID]

**Cycles**: [N] (1 implementation + N-1 fix cycles)

**Files changed**:
- [list of changed files]

**Tests**: type-check ✅  lint ✅  unit tests ✅

**Review**: Approved by principal-code-reviewer

**Next steps**:
- [ ] Run `/review-pr` or open a PR referencing [TICKET-ID] and linking to `.claude/plans/[TICKET-ID]-implementation.md`
- [ ] Move ticket to "In Review" in Jira
- [ ] Address any 🟢 Suggestions from the review at your discretion (listed below if any)
```

List any `🟢` Suggestions from the final review that the user may want to address in a follow-up.
