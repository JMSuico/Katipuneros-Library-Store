# Katipuneros Library Store -- Plugins & Skills Memory Cache
# Architectural Memory, Operational Principles & Rules Learned from C:\Users\provu\Desktop\PLUGINS

> **Binding Reference for all AI Agents, Subagents, and Developers**  
> *Adopted, applied, obeyed, and enforced across all layers of the Katipuneros Library Store.*

---

## 1. Executive Summary & Plugin Synthesis

This document functions as the permanent, authoritative memory cache and operational handbook distilled from the plugins and toolkits located in `C:\Users\provu\Desktop\PLUGINS`. Every AI agent, subagent, and human engineer interacting with this repository must strictly obey, apply, and enforce these synthesized design rules and architectural paradigms:

```
PLUGINS DIRECTORY ROSTER & OPERATIONAL RESPONSIBILITIES:
├── 1.  ui-ux-pro-max-skill       --> Design tokens, glassmorphism, 24-scale fluid responsiveness & WCAG AA
├── 2.  rtk                       --> High-density token efficiency, command compression & deterministic state flow
├── 3.  xlsx & Data Export/Ingest --> Multi-criteria CSV/Excel filtering, date-range slicing & batch ISBN parsing
├── 4.  playwright                --> Resilient E2E browser automation, multi-device viewports & visual regression
├── 5.  context7                  --> Anti-hallucination, strict context grounding & single source of truth
├── 6.  OmniRoute                 --> Layout persistence, hierarchical routing, 23 Hard Rules & drawer synchronization
├── 7.  headroom                  --> Dynamic sticky chrome, topbar elevation, backdrop-blur & context preservation
├── 8.  graphify                  --> Acyclic vertical-slice architecture, dependency enforcement & god-node prevention
├── 9.  caveman                   --> High-density code, universal lambda syntax (=>) & zero method ceremonies
├── 10. ralph & loop-eng          --> Autonomous builder/checker loops, PRD user stories & verification before completion
├── 11. one-skill-to-rule-them   --> Meta-orchestrator (task-observer): Spec -> Plan -> Implement -> Verify -> Review
├── 12. claude-code & claude-skills--> Agentic execution, systematic debugging, TDD & code review standards
├── 13. skills (Anthropic)        --> Standardized skill schemas, YAML frontmatter & repeatable domain procedures
├── 14. wazuh                     --> Security telemetry, threat velocity, intrusion alerts & active perimeter defense
├── 15. ghidra                    --> Structural code integrity, control-flow graph validation & decompiled flow audits
├── 16. GhidrAssist               --> Intelligent semantic labeling, automated structural verification & AST analysis
├── 17. radare2                   --> Smallest coherent fixes, hot-path efficiency & speculative abstraction avoidance
└── 18. ImHex                     --> Byte/block layout verification, cryptographic SHA-256 seals & Merkle trees
```

---

## 2. Deep Memory Cache & Operational Directives by Plugin

### Plugin 1: `ui-ux-pro-max-skill` (Design Intelligence & Token Taxonomy)
- **Token Hierarchy**:
  - `Primitive Tokens`: Raw design variables defined in CSS (`--color-teal-900`, `--font-sans`, `--spacing-md`).
  - `Semantic Tokens`: Intent-driven tokens (`var(--primary)`, `var(--action-green)`, `var(--surface-container-lowest)`, `var(--error)`).
  - `Component Tokens`: Scoped adapters consuming semantic tokens (`DefaultFloatingModalCard`, `SearchBar`, `AdminSwitch`, `RadioButton`).
- **Strict Color Governance**:
  - Raw hex strings (e.g. `#164E63`, `#00658A`) or arbitrary RGB values are strictly forbidden inside feature or page components. Always consume semantic tokens (`bg-primary`, `bg-surface-container-lowest`, `text-text-primary`, `border-outline-variant`).
- **Glassmorphism & Depth Elevation**:
  - Apply `backdrop-blur-xl`, `bg-surface/85`, and micro-borders (`border-white/10` or `border-outline-variant/20`) with balanced shadow tokens (`shadow-sm`, `shadow-xl`) to elevate modals, tooltips, and floating bulk action bars.
- **Fluid Responsiveness Across 24 Breakpoints**:
  - Centralize viewport scaling exclusively inside `Hooks/useFluidResposiveness.ts` (360px mobile up to 3840px 4K ultrawide). Component files must never mount inline resize listeners or custom window calculation loops.
- **Accessibility & ARIA (WCAG AA/AAA)**:
  - Form groups and radio lists must declare `role="radiogroup"`, `role="radio"`, `aria-checked`, and `aria-label`.
  - Checkboxes must provide descriptive accessibility labels (`aria-label={`Select item ${item.title}`}`).
  - Focus indicators must apply standard focus rings: `focus:ring-2 focus:ring-primary/30 outline-none`.

---

### Plugin 2: `rtk` (Rust Token Killer & State Governance)
- **High-Density Output & Token Efficiency**:
  - Minimize unnecessary terminal verbosity and code ceremony. Filter, group, and deduplicate outputs to maintain lean, hyper-efficient AI agent context windows.
- **Unidirectional Deterministic Data Flow**:
  - UI triggers events $\to$ Dispatches to typed API client (`booksApi.ts`, `userApi.ts`) $\to$ .NET 10 Controller $\to$ Service $\to$ Repository.
  - Responses normalize into immutable typed records; UI re-renders reactively without side-effects or circular state loops.
- **Optimistic UI with Reversion Fallback**:
  - When toggling patron clearance, approving holds, or executing shelf maintenance, update local state immediately for instant tactile feedback while persisting asynchronously. Revert state and notify via `useToasts.ts` upon backend rejection.

---

### Plugin 3: `xlsx` & Data Ingest/Export Pipeline
- **Multi-Criteria Filter Pipeline**:
  - **Temporal Slicing**: Slices records between `startDate` and `endDate` inclusive with ISO 8601 validation.
  - **Alphabetical Filtering**: Evaluates prefix (`startsWith`), suffix (`endsWith`), and substring (`contains`) matches.
  - **ID & Numeric Masking**: Evaluates accession numbers, barcode ranges, and library card prefixes.
  - **Sort Ordering**: Bidirectional sort (`asc` / `desc`) across chronological, alphabetic, or status criteria.
  - **MIME Type Dispatch**: Standardized export streams for CSV (`text/csv`) with quote escaping, and Excel (`application/vnd.ms-excel`).
- **Batch Accession Ingest Protocol**:
  - Ingests bulk CSV/Excel files or raw delimiter-separated ISBN/barcode strings.
  - Cleans hyphens and whitespace, checks ISBN-10/13 checksums, deduplicates against existing catalog holdings, and presents a dry-run confirmation modal before DB write.

---

### Plugin 4: `playwright` (End-to-End Multi-Device Automation)
- **Comprehensive Quality Checklist**:
  - Always verify across the complete operational surface:
    1. Initial application bootstrap, layout chrome, and persistent headers.
    2. Interactive sidebar navigation (dual-mode collapse to `w-20` and expansion to `w-64`).
    3. View-mode transformation (table row list to responsive card grid and back).
    4. Search debounce timing (300ms) and category drop-down filters.
    5. Modal lifecycle (creation, modification, inspection, deaccession, export).
    6. Multi-select table checkboxes and floating bulk action triggers.
    7. Multi-device viewport compatibility (`390x844`, `412x915`, `768x1024`, `1024x1366`, `1440x900`).
  - Capture automated screenshot artifacts at every milestone prior to declaring completion.

---

### Plugin 5: `context7` (Anti-Hallucination & Ground-Truth Context)
- **Golden Grounding Law**:
  - Never hallucinate non-existent database columns, synthetic mock data, or alternative component structures when canonical code exists.
  - Always inspect the existing schemas, models, and shared primitives first (`BooksManager.tsx`, `UserManagement.tsx`, `AppDbContext.cs`).
  - Augment existing domain models; never rewrite or disrupt established structural identities.

---

### Plugin 6: `OmniRoute` (Hierarchical Routing & Drawer Synchronization)
- **Layout Shell Persistence**:
  - Navigation across route hierarchies (`/admin/users`, `/admin/books`, `/admin/inventory`, `/admin/reservations`, etc.) must preserve sidebar state and scroll coordinates without flashes or re-mounting chrome.
- **Mobile Drawer Auto-Dismissal**:
  - On viewports $< 1024\text{px}$, route navigation or backdrop clicks must immediately dismiss the mobile drawer and restore viewport scrolling.
- **The 23 Hard Rules Compliance**:
  - Enforce strict route authorization guards, prevent unauthorized panel traversal, and isolate public landing layouts from authenticated role consoles.

---

### Plugin 7: `headroom` (Dynamic Sticky Chrome & Elevation)
- **Adaptive TopBar Behavior**:
  - The TopBar remains `fixed top-0` with dynamic horizontal offsets matching navigation drawer state (`left-64` when open, `left-20` when collapsed, `left-0` on mobile).
  - During table scrolling, navigation headers and floating bulk action bars maintain elevation via `backdrop-blur-xl` and strict layer coordinates (`z-40`, `z-30`).

---

### Plugin 8: `graphify` (Acyclic Vertical-Slice Architecture)
- **Strict Layer Isolation & God-Node Prevention**:
  ```
  Pages/ (Thin route composer, zero API calls, zero business logic)
    └── Features/ (UserRoles: AdminsPanel, CashiersPanel, CustomersPanel)
          ├── Endpoints/ (Typed API clients, DTOs, zero UI rendering)
          ├── Hooks/ (useFluidResposiveness, useDebounce, usePagination, usePagesGlobalRefresh)
          ├── Shared/ (DefaultFloatingModalCard, SearchBar, RadioButton, Dropdown)
          └── LayoutStyles/ (CSS variables, semantic tokens, typography)
  ```
- **Acyclic Import Invariant**: Lower layers never import from higher layers. Feature slices never cross-import internal modules of other panels. God-nodes (monolithic multi-thousand-line files with unbounded dependencies) must be refactored into focused, single-responsibility units.

---

### Plugin 9: `caveman` (Universal Expression-Bodied Lambda Syntax `=>`)
- **Conciseness & High Density**:
  - "Why use many tokens when few do trick." Eliminate boilerplate method ceremonies and redundant braces.
  - All synchronous and asynchronous routines across Repositories, Services, Controllers, Helpers, and TypeScript API stubs MUST use clean, readable expression bodies (`=>`) and pattern-matching `switch` expressions.

---

### Plugin 10: `ralph` & `loop-eng` (Closed-Loop Quality Polishing)
- **Autonomous Builder/Checker Loop**:
  - Tasks follow strict PRD specifications where each requirement must transition from `passes: false` to `passes: true` backed by machine-verified evidence.
  - Work is never declared complete until:
    1. Backend compiles with **0 warnings and 0 errors** (`dotnet build`).
    2. Frontend compiles with **0 errors** (`npm run build`).
    3. Browser and endpoint tests confirm live operational data flow.

---

### Plugin 11: `one-skill-to-rule-them-all` (Meta-Skill Orchestrator)
- **Self-Improving Task Observation**:
  - Continuously observes execution patterns across all skills and workflows.
  - Systematically enforces the 5-phase engineering lifecycle:
    $$\text{Specification (Spec)} \longrightarrow \text{Planning (Plan)} \longrightarrow \text{Implementation} \longrightarrow \text{Verification} \longrightarrow \text{Review / Sign-Off}$$

---

### Plugin 12: `claude-code` & `claude-skills` (Agentic Engineering Protocols)
- **Systematic Debugging & TDD**:
  - When encountering anomalies or test failures, investigate root causes before proposing patches.
  - Adhere to Test-Driven Development (TDD) principles: define expected behavior and validation criteria before writing production implementation.

---

### Plugin 13: `skills` (Standardized Agent Skills Architecture)
- **Repeatable Procedures & YAML Contracts**:
  - Structure all agent skills with explicit frontmatter (name, description, triggers), unambiguous procedural steps, and verifiable success criteria.

---

### Plugin 14: `wazuh` (Security Intelligence & Threat Velocity)
- **Active Perimeter & Audit Telemetry**:
  - Monitor intrusion anomalies, unauthorized privilege escalations, and credential abuse in real time.
  - Telemetry cards in `AuditLogs.tsx` and `Settings.tsx` monitor 24h event velocity, critical security infractions ($A_{\text{sec}}$), and trigger immediate administrative triage upon perimeter compromise.

---

### Plugin 15: `ghidra` & `GhidrAssist` (Structural Integrity & Flow Verification)
- **Control-Flow Graph & AST Validation**:
  - Audit method call-graphs across the backend service boundary to ensure zero architectural bypasses.
  - Ensure that every controller route traverses through authorized repository abstractions without direct database leaks.

---

### Plugin 16: `radare2` (Minimalist Coherent Patches & Hot-Path Efficiency)
- **Smallest Coherent Diffs**:
  - Avoid speculative refactoring, unrelated cleanups, or invasive structural churn.
  - Reuse existing helper routines and shared primitives; optimize hot paths (such as search debouncing and table drag-scrolling) to avoid redundant renders.

---

### Plugin 17: `ImHex` (Low-Level Cryptographic Seal & Byte Verification)
- **Cryptographic Chaining & Block Validation**:
  - Validate SHA-256 block hash chaining and Merkle tree roots for immutable system audit trails.
  - Verify HMAC-SHA256 digital seals on institutional exports and ledger archives to guarantee tamper-evident data protection.

---

## 3. Mandatory Operational Contract for All Subsequent Tasks

Every future implementation, bugfix, or enhancement in this repository MUST:
1. Consult this memory cache prior to proposing structural modifications.
2. Maintain strict zero-data fallbacks ($N=0$ displays `0`, `0.0%`, `₱0.00`, or clean empty states).
3. Apply `usePagesGlobalRefresh.ts` on all route views for seamless reconnection recovery.
4. Consume shared UI primitives from global `Frontend/src/Shared/` (`DefaultFloatingModalCard`, `SearchBar`, `Dropdown`, `RadioButton`).
5. Guarantee universal expression bodies (`=>`) and zero native `alert()` dialogs.
6. Verify both `dotnet build` and `npm run build` achieve 100% clean builds with zero errors before completion.
