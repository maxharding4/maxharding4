# Implementation Plan: $ARGUMENTS

Create a detailed implementation plan for the Jira ticket `$ARGUMENTS`.

## Instructions

You are a Principal Engineer creating an actionable implementation plan. Your goal is to produce a document that a developer can follow step-by-step to implement the ticket correctly and completely, including all tests.

### Step 1: Retrieve Ticket

Use the Jira MCP to fetch the full ticket for `$ARGUMENTS`, including:
- Description and acceptance criteria
- Child tickets and linked issues
- Comments (look for decisions, clarifications, edge cases)
- Attachments (Figma links, designs, documents)
- Labels, priority, assignee, reporter

If the ticket has child tickets, retrieve all of them before proceeding.

### Step 2: Analyse Requirements

Before writing the plan, thoroughly analyse:
- Every acceptance criterion — break each one into specific, testable conditions
- Designs/Figma — extract concrete UI requirements (components, states, interactions, responsive behaviour)
- Comments — surface any decisions, constraints, or edge cases
- Non-functional requirements — performance, security, accessibility expectations
- Analytics/tracking events if mentioned

Identify any ambiguities or contradictions and use **AskUserQuestion** to resolve critical ones before continuing. Do not proceed with a flawed understanding.

### Step 3: Generate Implementation Plan

Once requirements are clear, produce the implementation plan following the template below. Save it to `.claude/plans/$ARGUMENTS-implementation.md`.

---

## Implementation Plan Template

```markdown
# Implementation Plan: [TICKET-ID] — [Ticket Title]

**Generated**: [Current Date]
**Ticket**: [Full Jira URL]
**Branch**: `[suggested-branch-name]` (e.g. `feature/KAN-42-short-description`)

---

## 1. Ticket Summary

| Field | Value |
|-------|-------|
| Ticket ID | |
| Title | |
| Type | Story / Task / Bug / Epic |
| Priority | |
| Assignee | |
| Parent Ticket | (if applicable) |

**Description**:
[Full ticket description, preserving original wording]

---

## 2. Acceptance Criteria

List every AC exactly as written, then annotate each with what "done" concretely means.

| # | Criterion (original) | Done when… |
|---|----------------------|------------|
| 1 | | |

---

## 3. Implementation Steps

Break the work into ordered, self-contained steps. Each step should be small enough to commit independently.

### Step 1: [Name]

**What**: [What to build/change]
**Why**: [Which AC(s) this satisfies — reference by number]
**Files likely affected**:
- `path/to/file.ts` — [what changes]

**Key decisions / constraints**:
- [Any architectural decisions, patterns to follow, gotchas]

---

### Step 2: [Name]

(repeat for each step)

---

## 4. Test Plan

### 4.1 Unit Tests

For each logical unit of new/changed behaviour, specify:

| Test file | Scenario | Expected outcome | AC covered |
|-----------|----------|-----------------|------------|
| `path/to/component.test.tsx` | [scenario description] | [what it asserts] | AC #1 |

**Coverage requirements**:
- Happy path
- Edge cases (empty states, boundary values, error states)
- Any branching logic

### 4.2 Accessibility Tests

Identify all interactive and dynamic UI elements introduced or changed, then specify:

| Element / Component | Test | Tool / Method |
|--------------------|------|---------------|
| [e.g. Modal] | Focus is trapped while open | jest-axe / manual screen reader |
| [e.g. Form field] | Error message is announced by screen reader | aria-live / axe |
| [e.g. Button] | Has accessible name | jest-axe |

**Checklist** (mark N/A if not applicable):
- [ ] All interactive elements are keyboard-navigable
- [ ] Focus order is logical
- [ ] Colour contrast meets WCAG AA (4.5:1 text, 3:1 UI components)
- [ ] Images/icons have appropriate alt text or `aria-hidden`
- [ ] Dynamic content changes are announced (`aria-live`)
- [ ] Forms have associated labels and error messages linked via `aria-describedby`
- [ ] No content relies solely on colour to convey meaning
- [ ] Reduced motion preferences are respected if animations are involved

### 4.3 Security Tests

Identify any surface area that touches user input, auth, data persistence, or external services:

| Surface | Threat | Test / Mitigation |
|---------|--------|-------------------|
| [e.g. Form input] | XSS | Sanitised output, no `dangerouslySetInnerHTML` |
| [e.g. API call] | Unauthorised access | Auth token required, 401 on missing/invalid |
| [e.g. File upload] | Malicious content | MIME type and size validation |

**Checklist** (mark N/A if not applicable):
- [ ] All user input is validated and sanitised
- [ ] No sensitive data logged or exposed in error messages
- [ ] API endpoints require appropriate authentication/authorisation
- [ ] No secrets or credentials in client-side code
- [ ] CSRF protections in place for state-mutating requests
- [ ] Permissions checked on both client and server

---

## 5. Definition of Done

- [ ] All acceptance criteria met (see §2)
- [ ] Unit tests written and passing
- [ ] Accessibility checklist complete
- [ ] Security checklist complete
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] PR description references this plan and the Jira ticket
- [ ] (If applicable) Design reviewed against Figma

---

## 6. Open Questions

List anything that needs resolution before or during implementation:

- [ ] [Question] — *[who needs to answer / where to check]*

---

## 7. Out of Scope

[Anything explicitly deferred or not covered by this ticket]

- [Item]
```

---

After saving the file, output a brief summary:
- Ticket title and type
- Number of ACs covered
- Number of implementation steps
- Any open questions that need resolution
- The path where the plan was saved
