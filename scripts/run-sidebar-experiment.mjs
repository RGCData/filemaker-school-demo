import { mkdir, readFile, writeFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import { performance } from "node:perf_hooks"

const token = process.env.DEEPINFRA_TOKEN
if (!token) {
  throw new Error("DEEPINFRA_TOKEN is not available in this terminal.")
}

const configUrl = new URL("../../models.config.json", import.meta.url)
const outputDir = new URL("../metrics/raw/", import.meta.url)
const config = JSON.parse(await readFile(configUrl, "utf8"))
const endpoint = `${config.baseUrl}/chat/completions`
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
}

const sharedContext = `
PROJECT: School, a fictional art-college portal built with React 19, TypeScript,
Vite, Tailwind 4, shadcn/ui-style primitives, Base UI, Lucide icons, and a ReUI
Kanban. The existing app has a fixed 256px desktop sidebar and a Sheet-based
mobile menu. Routes include /student, classes, schedule, assignments, portfolio,
and /admin with students, classes, and critiques.

FEATURE: Extract a production-quality reusable left navigation component. It must
be data-driven from a typed array/object; support section labels, links, optional
icons, arbitrary nested children, active-route styling, independently collapsible
groups, a desktop rail/full-width toggle, tooltips in rail mode, keyboard and
screen-reader semantics, and a mobile Sheet. It must fit the existing visual system.

GUARDRAILS: No secrets, publishing, backend, new dependency, or unrelated feature.
Return concise implementation material only. The orchestrator owns final code.
`.trim()

const tasks = [
  {
    id: "architecture",
    role: "leadArchitect",
    model: config.roles.leadArchitect,
    maxTokens: 3000,
    reasoningEffort: "low",
    prompt: `${sharedContext}\n\nAct as the architecture delegate. Define the TypeScript schema, component API, state model, active-route rules, responsive behavior, and accessibility contract. Include 6-10 concrete acceptance tests. Do not write the full component.`,
  },
  {
    id: "implementation",
    role: "codingSpecialist",
    model: config.roles.codingSpecialist,
    maxTokens: 5000,
    reasoningEffort: "low",
    prompt: `${sharedContext}\n\nAct as the React implementation delegate. Propose compact, compilable TypeScript/TSX for a reusable component split into navigation.types.ts, navigation.config.ts, and app-sidebar.tsx. Favor recursive rendering and controlled/uncontrolled-friendly props. Call out integration changes in App.tsx.`,
  },
  {
    id: "test-and-metrics",
    role: "fastWorker",
    model: config.roles.fastWorker,
    maxTokens: 1200,
    prompt: `${sharedContext}\n\nAct as the fast test and metrics delegate. Return a prioritized interaction/accessibility test matrix and a rigorous method for estimating primary-model token displacement without calling estimates measured facts. Identify likely sidebar failure modes.`,
  },
]

const reviewSourceUrls = [
  new URL("../src/components/navigation/navigation.types.ts", import.meta.url),
  new URL("../src/components/navigation/navigation.config.ts", import.meta.url),
  new URL("../src/components/navigation/app-sidebar.tsx", import.meta.url),
]
const reviewSources = await Promise.all(
  reviewSourceUrls.map(async (url) => ({
    file: url.pathname.split("/").at(-1),
    content: await readFile(url, "utf8"),
  })),
)
tasks.push({
  id: "review",
  role: "escalationReviewer",
  model: config.roles.escalationReviewer,
  maxTokens: 3000,
  reasoningEffort: "low",
  prompt: `${sharedContext}\n\nAct as a senior reviewer. Inspect only the following new files. Report concrete P0/P1/P2 findings for correctness, route matching, React state, recursion, accessibility, responsive behavior, and unnecessary complexity. Do not rewrite the files. If a concern is speculative, label it.\n\n${reviewSources.map((source) => `--- ${source.file} ---\n${source.content}`).join("\n\n")}`,
})

const requestedTaskIds = new Set(process.argv.slice(2))
const selectedTasks = requestedTaskIds.size
  ? tasks.filter((task) => requestedTaskIds.has(task.id))
  : tasks.filter((task) => task.id !== "review")

if (!selectedTasks.length) {
  throw new Error(`No task matched: ${[...requestedTaskIds].join(", ")}`)
}

async function getCatalogPricing() {
  const response = await fetch("https://api.deepinfra.com/v1/models", { headers })
  if (!response.ok) throw new Error(`Model catalog failed with HTTP ${response.status}`)
  const payload = await response.json()
  return new Map(
    payload.data.map((model) => [model.id, model.metadata?.pricing ?? null]),
  )
}

function calculateCatalogCost(usage, pricing) {
  if (!usage || !pricing) return null
  const cached = usage.prompt_tokens_details?.cached_tokens ?? 0
  const regularInput = Math.max(0, (usage.prompt_tokens ?? 0) - cached)
  return (
    (regularInput * pricing.input_tokens +
      cached * (pricing.cache_read_tokens ?? pricing.input_tokens) +
      (usage.completion_tokens ?? 0) * pricing.output_tokens) /
    1_000_000
  )
}

async function runTask(task, pricing) {
  const startedAt = new Date().toISOString()
  const start = performance.now()
  const body = {
    model: task.model,
    messages: [
      {
        role: "system",
        content: "You are a bounded software-engineering delegate. Be precise, concise, and honest about uncertainty.",
      },
      { role: "user", content: task.prompt },
    ],
    temperature: 0.15,
    max_tokens: task.maxTokens,
    ...(task.reasoningEffort ? { reasoning_effort: task.reasoningEffort } : {}),
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  const payload = await response.json()
  const durationSeconds = (performance.now() - start) / 1000

  if (!response.ok) {
    return {
      ...task,
      prompt: undefined,
      promptSha256: createHash("sha256").update(task.prompt).digest("hex"),
      startedAt,
      durationSeconds,
      status: "failed",
      httpStatus: response.status,
      error: payload.error?.message ?? "Unknown provider error",
      pricing,
    }
  }

  const usage = payload.usage ?? null
  const content = payload.choices?.[0]?.message?.content ?? ""
  const reasoning = payload.choices?.[0]?.message?.reasoning_content ?? ""
  return {
    ...task,
    prompt: undefined,
    promptSha256: createHash("sha256").update(task.prompt).digest("hex"),
    startedAt,
    durationSeconds,
    status: content ? "completed" : "no-visible-output",
    httpStatus: response.status,
    finishReason: payload.choices?.[0]?.finish_reason ?? null,
    usage,
    pricing,
    providerEstimatedCost: usage?.estimated_cost ?? null,
    catalogCalculatedCost: calculateCatalogCost(usage, pricing),
    completionTokensPerSecond:
      usage?.completion_tokens ? usage.completion_tokens / durationSeconds : null,
    visibleCharacters: content.length,
    estimatedVisibleTokens: content ? Math.ceil(content.length / 4) : 0,
    reasoningCharacters: reasoning.length,
    content,
  }
}

await mkdir(outputDir, { recursive: true })
const pricingByModel = await getCatalogPricing()
const results = await Promise.all(
  selectedTasks.map((task) => runTask(task, pricingByModel.get(task.model))),
)
const completedAt = new Date().toISOString()
const run = {
  schemaVersion: 1,
  experiment: "reusable-sidebar",
  completedAt,
  methodology: {
    measured: ["API usage tokens", "wall-clock latency", "HTTP status", "provider estimated cost"],
    derived: ["tokens per second", "catalog-calculated cost", "estimated visible tokens from characters"],
    estimated: ["accepted contribution", "correction burden", "primary-model token displacement"],
    unavailable: ["exact Codex task tokens", "exact counterfactual tokens without rerunning the task"],
  },
  results,
}

const stamp = completedAt.replaceAll(":", "-").replaceAll(".", "-")
const runFile = new URL(`sidebar-${stamp}.json`, outputDir)
await writeFile(runFile, `${JSON.stringify(run, null, 2)}\n`, "utf8")
await writeFile(new URL("sidebar-latest.json", outputDir), `${JSON.stringify(run, null, 2)}\n`, "utf8")

for (const result of results) {
  const summary = [
    `# ${result.model}`,
    "",
    `- Role: ${result.role}`,
    `- Status: ${result.status}`,
    `- Duration: ${result.durationSeconds.toFixed(2)} seconds`,
    `- Prompt tokens: ${result.usage?.prompt_tokens ?? "not returned"}`,
    `- Completion tokens: ${result.usage?.completion_tokens ?? "not returned"}`,
    `- Provider cost: ${result.providerEstimatedCost ?? "not returned"}`,
    "",
    "## Response",
    "",
    result.content || "No visible response returned.",
    "",
  ].join("\n")
  await writeFile(new URL(`sidebar-${result.id}.md`, outputDir), summary, "utf8")
}

console.log(runFile.pathname)
for (const result of results) {
  console.log(
    `${result.model}: ${result.status}, ${result.usage?.total_tokens ?? 0} tokens, ${result.durationSeconds.toFixed(2)}s, $${(result.providerEstimatedCost ?? result.catalogCalculatedCost ?? 0).toFixed(6)}`,
  )
}
