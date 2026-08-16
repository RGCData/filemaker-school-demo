# School — Hybrid LLM Art-College Portal

School is a polished fictional art-college portal built as an experiment in hybrid AI software development. A GPT-5.6 Sol-based orchestrator owns architecture, integration, validation, and publishing while bounded implementation and review tasks are delegated to DeepInfra-hosted models.

All student, class, assignment, and portfolio information is fictional. This is a visual demonstration—not a production student-information system.

## Live demonstrations

- [Open the School portal](https://rgcdata.github.io/filemaker-school-demo/)
- [Open the interactive hybrid-vs-Sol metrics report](https://rgcdata.github.io/filemaker-school-demo/metrics/sidebar-experiment-report.html)

## Product features

- Student dashboard with current-term activity and announcements
- Clickable classes and detailed class views
- Weekly schedule and assignments
- Portfolio gallery
- Administrative dashboard
- Student and class management
- ReUI-style visual critique Kanban board
- Responsive mobile and desktop layouts
- Reusable, data-driven SaaS sidebar with nested navigation
- Collapsible desktop icon rail, tooltips, active routes, badges, and mobile Sheet

## Technology

- React 19 and TypeScript
- Vite 8
- Tailwind CSS 4
- shadcn/ui-style components backed by Base UI
- ReUI-inspired Kanban components
- Lucide icons
- GitHub Pages deployment through GitHub Actions

## Reusable navigation

The new sidebar is configured through a typed object in [`src/components/navigation/navigation.config.ts`](src/components/navigation/navigation.config.ts). Sections can contain links or nested groups, with optional icons, badges, descriptions, and default-open states.

The component implementation and usage notes are available in:

- [`src/components/navigation/app-sidebar.tsx`](src/components/navigation/app-sidebar.tsx)
- [`src/components/navigation/README.md`](src/components/navigation/README.md)

## Hybrid model experiment

The reusable-sidebar experiment called four DeepInfra models in bounded roles:

| Role | Model |
| --- | --- |
| Architecture | `zai-org/GLM-5.2` |
| React implementation attempt | `moonshotai/Kimi-K2.7-Code` |
| Test and metrics review | `deepseek-ai/DeepSeek-V4-Flash` |
| Escalation review | `deepseek-ai/DeepSeek-V4-Pro` |

### Measured DeepInfra results

- 20,463 total tokens
- 5,343 prompt tokens
- 15,120 completion tokens
- $0.048014 measured provider cost
- 16,788 tokens belonged to calls that returned no visible deliverable
- GLM's successful retry and DeepSeek V4 Flash supplied the useful delegated material

Failed calls remain in the totals. They are not removed to make the experiment look more efficient.

### Estimated GPT-5.6 Sol comparison

The interactive report compares this hybrid workflow with:

1. One GPT-5.6 Sol task handling the complete feature
2. A GPT-5.6 Sol lead spawning Sol/GPT-5.5-class Codex agents

Under the report's editable default assumptions, hybrid orchestration is estimated to preserve:

- **35.5% of Codex credits** versus one Sol-only task
- **66.0% of Codex credits** versus Sol with Codex subagents
- **27.7% in API-equivalent cost** versus one Sol-only task
- **61.9% in API-equivalent cost** versus Sol with Codex subagents

The DeepInfra usage is measured. The Sol token counts are disclosed counterfactual estimates because Codex does not expose an exact task-level token ledger for this experiment. The report lets visitors change all primary-model token assumptions and immediately recalculates the comparison.

## Run locally

```powershell
npm install
npm run dev
```

Open the local URL shown by Vite, normally `http://localhost:5173`.

## Validate and build

```powershell
npm run check
npm run build
```

The production files are generated in `dist`.

## Metrics tooling

```powershell
npm run experiment:sidebar
npm run report:sidebar
```

`experiment:sidebar` requires `DEEPINFRA_TOKEN` in the local environment. The token is never written to the report, source code, browser bundle, or Git history. Raw experiment responses are excluded from Git.
