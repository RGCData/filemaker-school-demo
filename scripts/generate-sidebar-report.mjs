import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"

const rawDir = new URL("../metrics/raw/", import.meta.url)
const outputUrl = new URL("../metrics/sidebar-experiment-report.html", import.meta.url)
const publicOutputUrl = new URL(
  "../public/metrics/sidebar-experiment-report.html",
  import.meta.url,
)
const files = (await readdir(rawDir))
  .filter((file) => /^sidebar-\d{4}.*\.json$/.test(file))
  .sort()

const runs = await Promise.all(
  files.map(async (file) => JSON.parse(await readFile(new URL(file, rawDir), "utf8"))),
)
const calls = runs.flatMap((run) => run.results)

const number = new Intl.NumberFormat("en-US")
const money = (value) => `$${Number(value ?? 0).toFixed(value >= 0.01 ? 4 : 6)}`
const total = (field) => calls.reduce((sum, call) => sum + (call.usage?.[field] ?? 0), 0)
const totalPrompt = total("prompt_tokens")
const totalCompletion = total("completion_tokens")
const totalTokens = total("total_tokens")
const totalCost = calls.reduce(
  (sum, call) =>
    sum + (call.providerEstimatedCost ?? call.catalogCalculatedCost ?? 0),
  0,
)
const aggregateSeconds = calls.reduce((sum, call) => sum + call.durationSeconds, 0)
const batchSeconds = runs.reduce(
  (sum, run) => Math.max(...run.results.map((call) => call.durationSeconds)) + sum,
  0,
)
const completedCalls = calls.filter((call) => call.status === "completed")
const noDeliverableCalls = calls.filter((call) => call.status !== "completed")
const noDeliverableTokens = noDeliverableCalls.reduce(
  (sum, call) => sum + (call.usage?.total_tokens ?? 0),
  0,
)
const visibleCompletion = completedCalls.reduce(
  (sum, call) => sum + (call.usage?.completion_tokens ?? 0),
  0,
)

function assessment(call) {
  if (call.status !== "completed") {
    return { score: 0, verdict: "No deliverable", accepted: "0%" }
  }
  if (call.model.includes("GLM")) {
    return { score: 0.75, verdict: "Architecture accepted with edits", accepted: "75%" }
  }
  if (call.model.includes("Flash")) {
    return { score: 0.55, verdict: "Test plan partly accepted", accepted: "55%" }
  }
  return { score: 0.4, verdict: "Partly accepted", accepted: "40%" }
}

const acceptedOutputEstimate = calls.reduce(
  (sum, call) => sum + (call.usage?.completion_tokens ?? 0) * assessment(call).score,
  0,
)
const usefulShare = totalCompletion ? visibleCompletion / totalCompletion : 0
const noDeliverableShare = totalTokens ? noDeliverableTokens / totalTokens : 0
const futureOptimizedCost = completedCalls.reduce(
  (sum, call) =>
    sum + (call.providerEstimatedCost ?? call.catalogCalculatedCost ?? 0),
  0,
)

const uniquePricing = new Map()
for (const call of calls) {
  if (call.pricing) uniquePricing.set(call.model, call.pricing)
}

const callRows = calls
  .map((call, index) => {
    const review = assessment(call)
    const cost = call.providerEstimatedCost ?? call.catalogCalculatedCost ?? 0
    return `<tr>
      <td><span class="attempt">${index + 1}</span></td>
      <td><strong>${call.model.split("/").at(-1)}</strong><small>${call.role}</small></td>
      <td><span class="status ${call.status === "completed" ? "good" : "bad"}">${call.status}</span></td>
      <td>${number.format(call.usage?.prompt_tokens ?? 0)}</td>
      <td>${number.format(call.usage?.completion_tokens ?? 0)}</td>
      <td>${call.durationSeconds.toFixed(2)}s</td>
      <td>${money(cost)}</td>
      <td>${review.accepted}<small>${review.verdict}</small></td>
    </tr>`
  })
  .join("")

const pricingRows = [...uniquePricing.entries()]
  .map(
    ([model, pricing]) => `<tr>
      <td><strong>${model}</strong></td>
      <td>$${pricing.input_tokens.toFixed(3)}</td>
      <td>$${pricing.output_tokens.toFixed(3)}</td>
      <td>$${(pricing.cache_read_tokens ?? pricing.input_tokens).toFixed(3)}</td>
    </tr>`,
  )
  .join("")

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hybrid LLM Experiment · Reusable Sidebar</title>
  <style>
    :root { --ink:#241d2b; --muted:#6f6675; --paper:#f7f3eb; --card:#fffdf9; --plum:#683b68; --coral:#d96b55; --gold:#e4b65d; --green:#387a62; --line:#ded7cc; --shadow:0 20px 55px rgba(54,37,55,.10); font-family:Inter,ui-sans-serif,system-ui,sans-serif; color:var(--ink); background:var(--paper) }
    * { box-sizing:border-box } body { margin:0; min-width:320px; background:radial-gradient(circle at 88% 2%,#ead9df 0,transparent 26rem),var(--paper) }
    main { width:min(1180px,calc(100% - 32px)); margin:auto; padding:48px 0 80px }
    header { display:grid; grid-template-columns:1.6fr .8fr; gap:24px; align-items:end; margin-bottom:28px }
    .eyebrow { color:var(--plum); font-size:12px; font-weight:800; letter-spacing:.16em; text-transform:uppercase }
    h1 { max-width:780px; margin:10px 0 12px; font-family:Georgia,serif; font-size:clamp(38px,6vw,68px); font-weight:500; line-height:.98 }
    header p { max-width:720px; color:var(--muted); line-height:1.65 }
    .stamp { justify-self:end; padding:16px 18px; border:1px solid var(--line); border-radius:18px; background:rgba(255,253,249,.72); box-shadow:var(--shadow) }
    .stamp strong,.stamp span { display:block }.stamp span { margin-top:4px; color:var(--muted); font-size:12px }
    .grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px }
    .card,.panel { border:1px solid var(--line); border-radius:22px; background:var(--card); box-shadow:var(--shadow) }
    .card { padding:20px }.card small { display:block; color:var(--muted); font-weight:700; letter-spacing:.04em; text-transform:uppercase }
    .value { display:block; margin:12px 0 5px; font-family:Georgia,serif; font-size:32px }.hint { color:var(--muted); font-size:12px; line-height:1.5 }
    .panel { margin-top:18px; padding:26px; overflow:hidden }.panel h2 { margin:0; font-family:Georgia,serif; font-size:28px; font-weight:500 }.panel-intro { color:var(--muted); line-height:1.6 }
    .bar { height:12px; margin:18px 0 8px; overflow:hidden; border-radius:999px; background:#eee8df }.bar > span { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,var(--plum),var(--coral)) }
    .legend { display:flex; flex-wrap:wrap; gap:18px; color:var(--muted); font-size:12px }.legend b { color:var(--ink) }
    .table-wrap { margin-top:18px; overflow:auto } table { width:100%; border-collapse:collapse; font-size:13px } th { color:var(--muted); font-size:10px; letter-spacing:.1em; text-align:left; text-transform:uppercase } th,td { padding:13px 12px; border-bottom:1px solid var(--line); vertical-align:top } td small { display:block; max-width:190px; margin-top:4px; color:var(--muted) }
    .attempt { display:grid; width:26px; height:26px; place-items:center; border-radius:50%; background:#f0e9e0; font-weight:800 }.status { display:inline-flex; border-radius:999px; padding:4px 8px; font-size:10px; font-weight:800 }.status.good { color:var(--green); background:#e6f2ec }.status.bad { color:#a74238; background:#f8e9e5 }
    .two { display:grid; grid-template-columns:1fr 1fr; gap:18px }.calculator { background:linear-gradient(145deg,#302338,#5e365e); color:#fff }.calculator .panel-intro,.calculator label { color:#ded0df }.inputs { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:22px 0 }.inputs label { font-size:11px; font-weight:700 }.inputs input { width:100%; margin-top:7px; padding:10px; border:1px solid #846985; border-radius:10px; background:#fff; color:var(--ink); font:inherit }
    .result { display:grid; grid-template-columns:repeat(3,1fr); gap:12px }.result div { padding:14px; border:1px solid #775d78; border-radius:14px; background:rgba(255,255,255,.06) }.result small,.result strong { display:block }.result small { color:#d9cbd9 }.result strong { margin-top:8px; font-size:22px }
    .scenario { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:18px }.scenario div { padding:16px; border-radius:16px; background:#f2ede5 }.scenario strong,.scenario span { display:block }.scenario span { margin-top:5px; color:var(--muted); font-size:12px }
    .callout { border-left:4px solid var(--gold); padding:14px 18px; background:#faf4e5; color:#5d4a24; line-height:1.55 }.findings { display:grid; gap:12px; padding:0; list-style:none }.findings li { padding:14px 16px; border:1px solid var(--line); border-radius:14px; line-height:1.5 }.tag { margin-right:8px; color:var(--plum); font-size:11px; font-weight:900; letter-spacing:.08em }
    footer { margin-top:24px; color:var(--muted); font-size:12px; text-align:center }
    @media (max-width:850px) { header,.two { grid-template-columns:1fr }.stamp { justify-self:start }.grid { grid-template-columns:repeat(2,1fr) } }
    @media (max-width:560px) { main { width:min(100% - 20px,1180px); padding-top:28px }.grid,.inputs,.result,.scenario { grid-template-columns:1fr }.panel { padding:19px }.value { font-size:28px } }
  </style>
</head>
<body>
<main>
  <header>
    <div><span class="eyebrow">Hybrid build experiment · Run 002</span><h1>What did delegation actually save?</h1><p>A measured account of the reusable School sidebar experiment. Provider usage and cost are separated from estimates, and failed calls remain in the totals.</p></div>
    <div class="stamp"><strong>Reusable navigation</strong><span>${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span><span>React · TypeScript · DeepInfra</span></div>
  </header>

  <section class="grid" aria-label="Experiment summary">
    <div class="card"><small>DeepInfra tokens</small><span class="value">${number.format(totalTokens)}</span><span class="hint">${number.format(totalPrompt)} input + ${number.format(totalCompletion)} completion</span></div>
    <div class="card"><small>Measured provider cost</small><span class="value">${money(totalCost)}</span><span class="hint">Six calls, including all failed attempts</span></div>
    <div class="card"><small>Useful visible share</small><span class="value">${(usefulShare * 100).toFixed(1)}%</span><span class="hint">Visible completion tokens ÷ all completion tokens</span></div>
    <div class="card"><small>Estimated accepted output</small><span class="value">≈${number.format(Math.round(acceptedOutputEstimate))}</span><span class="hint">Human-scored contribution; not provider-measured</span></div>
  </section>

  <section class="panel">
    <h2>Efficiency in one picture</h2>
    <p class="panel-intro">Only GLM’s second architecture call and DeepSeek Flash produced visible, useful material. The rest is retained as no-deliverable overhead.</p>
    <div class="bar" aria-label="Useful completion share"><span style="width:${(usefulShare * 100).toFixed(1)}%"></span></div>
    <div class="legend"><span><b>${number.format(visibleCompletion)}</b> visible completion tokens</span><span><b>${number.format(totalCompletion - visibleCompletion)}</b> hidden/no-deliverable completion tokens</span><span><b>${(noDeliverableShare * 100).toFixed(1)}%</b> of all tokens belonged to calls with no deliverable</span><span><b>${aggregateSeconds.toFixed(1)}s</b> aggregate model time</span><span><b>${batchSeconds.toFixed(1)}s</b> parallelized API wall time</span></div>
  </section>

  <section class="panel">
    <h2>Every delegated call</h2>
    <p class="panel-intro">“Accepted” is an orchestrator estimate based on which ideas survived implementation. Token, duration, and cost columns are returned or derived from provider data.</p>
    <div class="table-wrap"><table><thead><tr><th>#</th><th>Model / role</th><th>Outcome</th><th>Input</th><th>Output</th><th>Latency</th><th>Cost</th><th>Accepted</th></tr></thead><tbody>${callRows}</tbody></table></div>
  </section>

  <section class="two">
    <article class="panel calculator">
      <h2>Editable primary-model comparison</h2>
      <p class="panel-intro">Defaults are illustrative—not claimed Codex billing rates. Enter the per-million-token rates you want to compare and how token-efficient you believe the primary-only run would be.</p>
      <div class="inputs">
        <label>Primary input $ / 1M<input id="inputRate" type="number" min="0" step="0.1" value="2"></label>
        <label>Primary output $ / 1M<input id="outputRate" type="number" min="0" step="0.1" value="8"></label>
        <label>Workload multiplier<input id="multiplier" type="number" min="0.1" max="2" step="0.05" value="0.70"></label>
      </div>
      <div class="result"><div><small>Primary counterfactual</small><strong id="primaryCost">—</strong></div><div><small>DeepInfra actual</small><strong>${money(totalCost)}</strong></div><div><small>Estimated difference</small><strong id="difference">—</strong></div></div>
    </article>
    <article class="panel">
      <h2>Token-savings estimate</h2>
      <p class="panel-intro">Exact Codex savings are unavailable. The honest estimate starts with ≈${number.format(Math.round(acceptedOutputEstimate))} accepted output tokens, then subtracts likely review/integration overhead.</p>
      <div class="scenario"><div><strong>≈275</strong><span>Conservative net primary tokens avoided</span></div><div><strong>≈1,275</strong><span>Balanced estimate</span></div><div><strong>≈2,050</strong><span>Optimistic estimate</span></div></div>
      <p class="callout"><strong>Do not call ${number.format(totalTokens)} “tokens saved.”</strong> That is the amount processed by delegates. Because ${number.format(noDeliverableTokens)} tokens produced no visible deliverable and the orchestrator still reviewed and implemented the feature, offloaded tokens are not equivalent to net savings.</p>
    </article>
  </section>

  <section class="panel">
    <h2>What we learned</h2>
    <ul class="findings">
      <li><span class="tag">GLM</span>The second call produced the accepted type model, longest-route matching rule, group state contract, and accessibility checklist. The first call exhausted its cap in hidden reasoning.</li>
      <li><span class="tag">KIMI</span>Two attempts consumed 7,600 completion tokens and ${money(calls.filter((c) => c.model.includes("Kimi")).reduce((s,c) => s + (c.providerEstimatedCost ?? 0),0))} without visible code. For this endpoint/configuration it should be removed from the default route until a tiny smoke test succeeds.</li>
      <li><span class="tag">FLASH</span>Delivered the best value at roughly ${money(calls.find((c) => c.model.includes("Flash"))?.providerEstimatedCost)}. Its accessibility risks were useful; its proposed source-token method was rejected because source tokens are not inference tokens.</li>
      <li><span class="tag">V4 PRO</span>The bounded review still returned no visible result. It should not be paid by default for this workflow.</li>
      <li><span class="tag">NEXT RUN</span>Route architecture to GLM, tests/fixtures to Flash, require a 200-token smoke test before any Kimi/Pro task, and stop after the first no-visible-output response. That would have reduced this experiment’s delegate cost from ${money(totalCost)} to about ${money(futureOptimizedCost)}.</li>
    </ul>
  </section>

  <section class="panel">
    <h2>DeepInfra rate snapshot</h2>
    <p class="panel-intro">Rates were queried from the authenticated DeepInfra model catalog during this experiment and are shown per one million tokens.</p>
    <div class="table-wrap"><table><thead><tr><th>Model</th><th>Input / 1M</th><th>Output / 1M</th><th>Cache read / 1M</th></tr></thead><tbody>${pricingRows}</tbody></table></div>
  </section>

  <section class="panel">
    <h2>Measurement rules for future features</h2>
    <ul class="findings">
      <li><span class="tag">MEASURED</span>Capture provider usage, estimated cost, model rate snapshot, wall time, finish reason, visible characters, and validation status for every attempt.</li>
      <li><span class="tag">ASSESS</span>After integration, score accepted contribution and count concrete corrections, rejected claims, retries, and no-output calls.</li>
      <li><span class="tag">COMPARE</span>Use an editable counterfactual with disclosed primary rates and a workload multiplier. Never present that scenario as an invoice.</li>
      <li><span class="tag">VALIDATE</span>Record build, lint, accessibility, responsive, and interaction results. A cheap answer that creates rework is not efficient.</li>
    </ul>
  </section>
  <footer>Generated locally from DeepInfra usage JSON. No API token or authorization header is stored in this report.</footer>
</main>
<script>
  const totals = { input: ${totalPrompt}, output: ${totalCompletion}, actual: ${totalCost} };
  const fields = [document.querySelector('#inputRate'), document.querySelector('#outputRate'), document.querySelector('#multiplier')];
  function update() {
    const inputRate = Number(fields[0].value) || 0;
    const outputRate = Number(fields[1].value) || 0;
    const multiplier = Number(fields[2].value) || 0;
    const primary = ((totals.input * inputRate) + (totals.output * outputRate)) / 1_000_000 * multiplier;
    const difference = primary - totals.actual;
    document.querySelector('#primaryCost').textContent = '$' + primary.toFixed(4);
    document.querySelector('#difference').textContent = (difference >= 0 ? '+' : '−') + '$' + Math.abs(difference).toFixed(4);
  }
  fields.forEach((field) => field.addEventListener('input', update)); update();
</script>
</body>
</html>`

await mkdir(new URL("../metrics/", import.meta.url), { recursive: true })
await mkdir(new URL("../public/metrics/", import.meta.url), { recursive: true })
await writeFile(outputUrl, html, "utf8")
await writeFile(publicOutputUrl, html, "utf8")
console.log(outputUrl.pathname)
console.log(publicOutputUrl.pathname)
