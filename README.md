# filemaker-school-demo
Demonstration of Local LLM creations under a master agent creating a turnkey react school management system


First metrics - Alex Seidler - RGC Data - 2AM - trial run #1:
FINAL ROUND-UP - 2026-08-15
---------------------------
Models used: GLM-5.2, Kimi-K2.7-Code, DeepSeek-V4-Flash, DeepSeek-V4-Pro
Best model for architecture: GLM-5.2
Best model for React implementation: Kimi-K2.7-Code after low-reasoning tuning, with substantial orchestrator correction
Best model for fast/support work: DeepSeek-V4-Flash
Best model for review/debugging: Orchestrator; V4 Pro returned no visible final review
Approximate model API duration: 255.57 seconds
Prompt tokens total: 14044
Completion tokens total: 19900
DeepInfra tokens total: 33944
Estimated DeepInfra cost total: $0.0706174
Useful visible completion tokens: approximately 10700
Hidden/no-visible completion tokens: 9200
Tokens offloaded from primary orchestrator: 33944
Exact primary-token savings: Not measurable without running the same build again with no delegates
Build status: Passed
Lint status: Passed with three generated shadcn fast-refresh warnings
Responsive review status: Passed desktop and 390x844 mobile navigation review
Accessibility review status: Major interactions keyboard-addressable; ReUI Kanban includes drag and explicit move buttons
Known limitations: Dummy local state only; no backend/auth/persistence; model reviews sometimes consumed hidden reasoning budgets
Recommended next step: Client visual review, then FTP the contents of school/dist

---- versus uses Codex SOL spawning subagents


-- Im working on better metrics to get an idea for how many mistakes they made.  I believe I stuck with KIMI (didnt use this time) QWEN Coder, DeekSeek v4 were the two main ones.  I was running 32b model Locals.

Took 2 tries and it was working.
