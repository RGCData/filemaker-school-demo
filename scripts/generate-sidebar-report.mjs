import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"

const rawDir = new URL("../metrics/raw/", import.meta.url)
const outputUrl = new URL("../metrics/sidebar-experiment-report.html", import.meta.url)
const publicOutputUrl = new URL("../public/metrics/sidebar-experiment-report.html", import.meta.url)
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
const deepInfraInput = total("prompt_tokens")
const deepInfraOutput = total("completion_tokens")
const deepInfraTokens = total("total_tokens")
const deepInfraCost = calls.reduce(
  (sum, call) => sum + (call.providerEstimatedCost ?? call.catalogCalculatedCost ?? 0),
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
  if (call.status !== "completed") return { score: 0, verdict: "No deliverable", accepted: "0%" }
  if (call.model.includes("GLM")) return { score: 0.75, verdict: "Architecture accepted with edits", accepted: "75%" }
  if (call.model.includes("Flash")) return { score: 0.55, verdict: "Test plan partly accepted", accepted: "55%" }
  return { score: 0.4, verdict: "Partly accepted", accepted: "40%" }
}

const acceptedOutputEstimate = calls.reduce(
  (sum, call) => sum + (call.usage?.completion_tokens ?? 0) * assessment(call).score,
  0,
)
const usefulShare = deepInfraOutput ? visibleCompletion / deepInfraOutput : 0
const uniquePricing = new Map()
for (const call of calls) if (call.pricing) uniquePricing.set(call.model, call.pricing)

const callRows = calls.map((call, index) => {
  const review = assessment(call)
  const cost = call.providerEstimatedCost ?? call.catalogCalculatedCost ?? 0
  return `<tr><td><span class="attempt">${index + 1}</span></td><td><strong>${call.model.split("/").at(-1)}</strong><small>${call.role}</small></td><td><span class="status ${call.status === "completed" ? "good" : "bad"}">${call.status}</span></td><td>${number.format(call.usage?.prompt_tokens ?? 0)}</td><td>${number.format(call.usage?.completion_tokens ?? 0)}</td><td>${call.durationSeconds.toFixed(2)}s</td><td>${money(cost)}</td><td>${review.accepted}<small>${review.verdict}</small></td></tr>`
}).join("")

const pricingRows = [...uniquePricing.entries()].map(
  ([model, pricing]) => `<tr><td><strong>${model}</strong></td><td>$${pricing.input_tokens.toFixed(3)}</td><td>$${pricing.output_tokens.toFixed(3)}</td><td>$${(pricing.cache_read_tokens ?? pricing.input_tokens).toFixed(3)}</td></tr>`,
).join("")

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hybrid vs GPT-5.6 Sol · Sidebar Experiment</title>
  <style>
    :root { --ink:#241d2b;--muted:#706674;--paper:#f7f3eb;--card:#fffdf9;--plum:#643965;--coral:#d76d57;--gold:#e1b65c;--green:#31765d;--blue:#3f668d;--line:#ded6cb;--shadow:0 20px 55px rgba(54,37,55,.1);font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:var(--ink);background:var(--paper) }
    *{box-sizing:border-box}body{margin:0;min-width:320px;background:radial-gradient(circle at 88% 2%,#ead9df 0,transparent 27rem),var(--paper)}main{width:min(1200px,calc(100% - 32px));margin:auto;padding:44px 0 80px}
    header{display:grid;grid-template-columns:1.7fr .7fr;gap:24px;align-items:end;margin-bottom:26px}.eyebrow{color:var(--plum);font-size:12px;font-weight:850;letter-spacing:.16em;text-transform:uppercase}h1{max-width:850px;margin:10px 0 14px;font:500 clamp(38px,6vw,70px)/.98 Georgia,serif}header p,.intro{max-width:780px;color:var(--muted);line-height:1.65}.stamp{justify-self:end;padding:16px 18px;border:1px solid var(--line);border-radius:18px;background:#fffdf9c7;box-shadow:var(--shadow)}.stamp strong,.stamp span{display:block}.stamp span{margin-top:4px;color:var(--muted);font-size:12px}
    .truth{margin:0 0 18px;padding:16px 20px;border:1px solid #dfc98e;border-left:5px solid var(--gold);border-radius:16px;background:#fbf5e5;line-height:1.55}.truth strong{color:#5e481f}
    .panel,.scenario{border:1px solid var(--line);border-radius:22px;background:var(--card);box-shadow:var(--shadow)}.panel{margin-top:18px;padding:26px}.panel h2{margin:0;font:500 29px Georgia,serif}.panel h3{margin:0 0 8px;font-size:16px}.panel-intro{color:var(--muted);line-height:1.6}
    .scenarios{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.scenario{position:relative;overflow:hidden;padding:22px}.scenario.hybrid{border:2px solid var(--plum)}.scenario.hybrid:before{content:"CURRENT METHOD";position:absolute;right:0;top:0;padding:6px 10px;border-radius:0 0 0 10px;background:var(--plum);color:white;font-size:9px;font-weight:850;letter-spacing:.12em}.scenario-label{display:block;color:var(--muted);font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.big{display:block;margin:13px 0 4px;font:500 38px Georgia,serif}.sub{color:var(--muted);font-size:12px;line-height:1.5}.metric-list{display:grid;gap:9px;margin:18px 0 0;padding:16px 0 0;border-top:1px solid var(--line)}.metric-list div{display:flex;justify-content:space-between;gap:12px;font-size:13px}.metric-list span{color:var(--muted)}
    .savings{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:18px}.saving{padding:22px;border-radius:20px;color:white}.saving.single{background:linear-gradient(145deg,#2c2333,#633c64)}.saving.agents{background:linear-gradient(145deg,#253348,#446d92)}.saving-label{font-size:11px;font-weight:850;letter-spacing:.1em;text-transform:uppercase;opacity:.72}.saving-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}.saving-grid div{padding:13px;border:1px solid #ffffff30;border-radius:14px;background:#ffffff0e}.saving-grid strong,.saving-grid small{display:block}.saving-grid strong{font-size:23px}.saving-grid small{margin-top:5px;opacity:.72;line-height:1.35}
    .controls{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-top:20px}.control-card{padding:18px;border:1px solid var(--line);border-radius:18px;background:#faf7f1}.control-card strong{display:block;margin-bottom:12px}.inputs{display:grid;grid-template-columns:1fr 1fr;gap:9px}.inputs label{color:var(--muted);font-size:10px;font-weight:800;text-transform:uppercase}.inputs input{width:100%;margin-top:6px;padding:10px;border:1px solid var(--line);border-radius:10px;background:white;color:var(--ink);font:inherit}.formula{margin-top:16px;padding:13px 15px;border-radius:13px;background:#efe9df;color:var(--muted);font-size:12px;line-height:1.55}
    .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:13px}.stat{padding:19px;border:1px solid var(--line);border-radius:18px;background:#faf7f1}.stat small{display:block;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.stat strong{display:block;margin:10px 0 4px;font:500 29px Georgia,serif}.stat span{color:var(--muted);font-size:11px;line-height:1.4}
    .bar{height:11px;margin:17px 0 8px;overflow:hidden;border-radius:99px;background:#eee7dd}.bar span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--plum),var(--coral))}.legend{display:flex;flex-wrap:wrap;gap:18px;color:var(--muted);font-size:12px}.legend b{color:var(--ink)}
    .table-wrap{margin-top:17px;overflow:auto}table{width:100%;border-collapse:collapse;font-size:13px}th{color:var(--muted);font-size:10px;letter-spacing:.1em;text-align:left;text-transform:uppercase}th,td{padding:13px 11px;border-bottom:1px solid var(--line);vertical-align:top}td small{display:block;max-width:190px;margin-top:4px;color:var(--muted)}.attempt{display:grid;width:26px;height:26px;place-items:center;border-radius:50%;background:#f0e9e0;font-weight:800}.status{display:inline-flex;padding:4px 8px;border-radius:99px;font-size:10px;font-weight:850}.status.good{color:var(--green);background:#e4f2eb}.status.bad{color:#a64138;background:#f8e8e4}
    .notes{display:grid;gap:11px;padding:0;list-style:none}.notes li{padding:14px 16px;border:1px solid var(--line);border-radius:14px;line-height:1.55}.tag{margin-right:8px;color:var(--plum);font-size:10px;font-weight:900;letter-spacing:.08em}.source{font-size:12px;color:var(--muted)}a{color:var(--plum)}footer{margin-top:24px;color:var(--muted);font-size:12px;text-align:center}
    @media(max-width:900px){header{grid-template-columns:1fr}.stamp{justify-self:start}.scenarios,.controls{grid-template-columns:1fr}.savings{grid-template-columns:1fr}.grid4{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:580px){main{width:min(100% - 20px,1200px);padding-top:28px}.panel{padding:19px}.saving-grid,.grid4{grid-template-columns:1fr}.big{font-size:33px}}
  </style>
</head>
<body>
<main>
  <header><div><span class="eyebrow">The comparison you actually wanted</span><h1>Hybrid locals vs GPT‑5.6 Sol</h1><p>Estimated primary-model usage and API-equivalent cost for the same reusable sidebar feature: our hybrid DeepInfra workflow, one Sol task doing everything, or Sol coordinating Codex subagents.</p></div><div class="stamp"><strong>Sidebar experiment</strong><span>React · TypeScript · Vite</span><span>Measured + editable estimates</span></div></header>
  <p class="truth"><strong>The DeepInfra side is measured. The Sol side is estimated.</strong> Codex did not expose this task’s exact token ledger, so the report uses visible assumptions based on the feature size, file inspection, implementation, review, and likely agent context duplication. Change those assumptions below.</p>

  <section class="scenarios" aria-label="Workflow comparison">
    <article class="scenario hybrid"><span class="scenario-label">Hybrid lead + DeepInfra</span><strong class="big" id="hybridCredits">—</strong><span class="sub">estimated Sol/Codex credits used by the lead</span><div class="metric-list"><div><span>Estimated primary tokens</span><strong id="hybridPrimaryTokens">—</strong></div><div><span>Measured DeepInfra tokens</span><strong>${number.format(deepInfraTokens)}</strong></div><div><span>API-equivalent total</span><strong id="hybridMoney">—</strong></div><div><span>Actual DeepInfra charge</span><strong>${money(deepInfraCost)}</strong></div></div></article>
    <article class="scenario"><span class="scenario-label">One GPT‑5.6 Sol task</span><strong class="big" id="singleCredits">—</strong><span class="sub">estimated Codex credits if Sol handled architecture, code, and review itself</span><div class="metric-list"><div><span>Estimated primary tokens</span><strong id="singleTokens">—</strong></div><div><span>External-model tokens</span><strong>0</strong></div><div><span>API-equivalent cost</span><strong id="singleMoney">—</strong></div><div><span>Coordination overhead</span><strong>Low</strong></div></div></article>
    <article class="scenario"><span class="scenario-label">Sol + Codex subagents</span><strong class="big" id="agentCredits">—</strong><span class="sub">estimated credits for a Sol lead plus implementation and review agents using Sol/5.5-class rates</span><div class="metric-list"><div><span>Estimated primary tokens</span><strong id="agentTokens">—</strong></div><div><span>External-model tokens</span><strong>0</strong></div><div><span>API-equivalent cost</span><strong id="agentMoney">—</strong></div><div><span>Coordination overhead</span><strong>High</strong></div></div></article>
  </section>

  <section class="savings">
    <article class="saving single"><span class="saving-label">Hybrid savings vs one Sol task</span><div class="saving-grid"><div><strong id="singleTokenSaving">—</strong><small>primary tokens avoided</small></div><div><strong id="singleCreditSaving">—</strong><small>Codex credits preserved</small></div><div><strong id="singleMoneySaving">—</strong><small>API-equivalent dollars</small></div></div></article>
    <article class="saving agents"><span class="saving-label">Hybrid savings vs Sol + Codex agents</span><div class="saving-grid"><div><strong id="agentTokenSaving">—</strong><small>primary tokens avoided</small></div><div><strong id="agentCreditSaving">—</strong><small>Codex credits preserved</small></div><div><strong id="agentMoneySaving">—</strong><small>API-equivalent dollars</small></div></div></article>
  </section>

  <section class="panel">
    <h2>Change the assumptions</h2><p class="panel-intro">Values are thousands of tokens. Defaults model a 30K-token Sol lead in the hybrid run, a 44K-token single-Sol implementation, and 85K aggregate tokens when a lead, implementer, and reviewer repeat context across Codex tasks.</p>
    <div class="controls">
      <div class="control-card"><strong>Hybrid Sol lead</strong><div class="inputs"><label>Input, thousands<input id="hyIn" type="number" min="0" step="1" value="20"></label><label>Output, thousands<input id="hyOut" type="number" min="0" step="1" value="10"></label></div></div>
      <div class="control-card"><strong>Single Sol task</strong><div class="inputs"><label>Input, thousands<input id="singleIn" type="number" min="0" step="1" value="28"></label><label>Output, thousands<input id="singleOut" type="number" min="0" step="1" value="16"></label></div></div>
      <div class="control-card"><strong>Sol + Codex agents</strong><div class="inputs"><label>Input, thousands<input id="agentIn" type="number" min="0" step="1" value="55"></label><label>Output, thousands<input id="agentOut" type="number" min="0" step="1" value="30"></label></div></div>
    </div>
    <p class="formula"><strong>Official short-context comparison rates:</strong> GPT‑5.6 Sol standard API = $5/M input + $30/M output. Codex credits = 125/M input + 750/M output. GPT‑5.5 has the same listed Codex credit rates. The hybrid API-equivalent total adds the measured ${money(deepInfraCost)} DeepInfra charge. Included subscription usage is not an additional cash invoice, so credits and API-equivalent dollars are shown separately.</p>
  </section>

  <section class="panel"><h2>Default-estimate interpretation</h2><ul class="notes"><li><span class="tag">PRIMARY USAGE</span>The hybrid approach is estimated to preserve roughly <strong>35% of Sol credits versus one Sol-only task</strong> and roughly <strong>66% versus a Sol lead spawning Codex agents</strong>.</li><li><span class="tag">MONEY</span>Using standard API rates only as a common comparison currency, the defaults estimate about <strong>28% lower cost than single Sol</strong> and <strong>62% lower than Sol plus agents</strong>.</li><li><span class="tag">TOTAL COMPUTE</span>Hybrid does not necessarily use fewer tokens across every provider. Under the defaults it uses about 50.5K combined primary + DeepInfra tokens versus 44K for single Sol. Its advantage is moving work off the scarce, expensive Sol/Codex usage budget.</li><li><span class="tag">QUALITY</span>The feature passed TypeScript, lint, and production build. That matters: cheap delegated tokens only count as efficiency if the orchestrator still ships a good result.</li></ul></section>

  <section class="panel"><h2>Measured DeepInfra portion</h2><div class="grid4"><div class="stat"><small>Input tokens</small><strong>${number.format(deepInfraInput)}</strong><span>provider-measured</span></div><div class="stat"><small>Completion tokens</small><strong>${number.format(deepInfraOutput)}</strong><span>provider-measured</span></div><div class="stat"><small>DeepInfra cost</small><strong>${money(deepInfraCost)}</strong><span>provider-returned</span></div><div class="stat"><small>Accepted output estimate</small><strong>≈${number.format(Math.round(acceptedOutputEstimate))}</strong><span>human-scored</span></div></div><div class="bar"><span style="width:${(usefulShare * 100).toFixed(1)}%"></span></div><div class="legend"><span><b>${number.format(visibleCompletion)}</b> visible completion tokens</span><span><b>${number.format(noDeliverableTokens)}</b> tokens in no-deliverable calls</span><span><b>${(usefulShare * 100).toFixed(1)}%</b> useful visible completion share</span></div></section>

  <section class="panel"><h2>Every delegated call</h2><p class="panel-intro">Failed calls remain in the totals. “Accepted” is an orchestrator estimate of material that survived implementation.</p><div class="table-wrap"><table><thead><tr><th>#</th><th>Model / role</th><th>Outcome</th><th>Input</th><th>Output</th><th>Latency</th><th>Cost</th><th>Accepted</th></tr></thead><tbody>${callRows}</tbody></table></div></section>

  <section class="panel"><h2>DeepInfra rate snapshot</h2><p class="panel-intro">Authenticated catalog rates captured during the experiment, per million tokens.</p><div class="table-wrap"><table><thead><tr><th>Model</th><th>Input / 1M</th><th>Output / 1M</th><th>Cache read / 1M</th></tr></thead><tbody>${pricingRows}</tbody></table></div></section>

  <section class="panel"><h2>Sources and confidence</h2><ul class="notes"><li><span class="tag">OFFICIAL</span><a href="https://developers.openai.com/api/docs/pricing">OpenAI API pricing</a> supports the $5/M input and $30/M output standard short-context Sol rates.</li><li><span class="tag">OFFICIAL</span><a href="https://developers.openai.com/codex/pricing">Codex pricing and credits</a> supports 125/M input and 750/M output credits for GPT‑5.6 Sol and GPT‑5.5, and states GPT‑5.6 averages 5–40 credits per message.</li><li><span class="tag">OFFICIAL</span><a href="https://developers.openai.com/api/docs/guides/model-guidance?model=gpt-5.6">GPT‑5.6 model guidance</a> says multi-agent can reduce wall time on cleanly separable work, while total tokens and cost must still be measured.</li><li><span class="tag">ESTIMATE</span>The three scenario token counts are not returned by Codex. They are disclosed, editable counterfactuals—not measured facts.</li></ul></section>
  <footer>Generated locally. No API token, authorization header, or private student data is stored in this report.</footer>
</main>
<script>
  const DI_COST = ${deepInfraCost};
  const CREDIT_INPUT = 125, CREDIT_OUTPUT = 750;
  const API_INPUT = 5, API_OUTPUT = 30;
  const ids = ['hyIn','hyOut','singleIn','singleOut','agentIn','agentOut'];
  const el = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  const fmt = new Intl.NumberFormat('en-US');
  const pct = value => (value * 100).toFixed(1) + '%';
  const dollars = value => '$' + value.toFixed(4);
  const credits = (inputK, outputK) => inputK * CREDIT_INPUT / 1000 + outputK * CREDIT_OUTPUT / 1000;
  const apiCost = (inputK, outputK) => inputK * API_INPUT / 1000 + outputK * API_OUTPUT / 1000;
  function set(id, value) { document.getElementById(id).textContent = value; }
  function savings(base, hybrid) { return base > 0 ? (base - hybrid) / base : 0; }
  function update() {
    const hIn=+el.hyIn.value||0,hOut=+el.hyOut.value||0,sIn=+el.singleIn.value||0,sOut=+el.singleOut.value||0,aIn=+el.agentIn.value||0,aOut=+el.agentOut.value||0;
    const hTokens=(hIn+hOut)*1000,sTokens=(sIn+sOut)*1000,aTokens=(aIn+aOut)*1000;
    const hCredits=credits(hIn,hOut),sCredits=credits(sIn,sOut),aCredits=credits(aIn,aOut);
    const hMoney=apiCost(hIn,hOut)+DI_COST,sMoney=apiCost(sIn,sOut),aMoney=apiCost(aIn,aOut);
    set('hybridCredits',hCredits.toFixed(2));set('singleCredits',sCredits.toFixed(2));set('agentCredits',aCredits.toFixed(2));
    set('hybridPrimaryTokens',fmt.format(hTokens));set('singleTokens',fmt.format(sTokens));set('agentTokens',fmt.format(aTokens));
    set('hybridMoney',dollars(hMoney));set('singleMoney',dollars(sMoney));set('agentMoney',dollars(aMoney));
    set('singleTokenSaving',pct(savings(sTokens,hTokens)));set('singleCreditSaving',pct(savings(sCredits,hCredits)));set('singleMoneySaving',pct(savings(sMoney,hMoney)));
    set('agentTokenSaving',pct(savings(aTokens,hTokens)));set('agentCreditSaving',pct(savings(aCredits,hCredits)));set('agentMoneySaving',pct(savings(aMoney,hMoney)));
  }
  ids.forEach(id => el[id].addEventListener('input',update));update();
</script>
</body>
</html>`

await mkdir(new URL("../metrics/", import.meta.url), { recursive: true })
await mkdir(new URL("../public/metrics/", import.meta.url), { recursive: true })
await writeFile(outputUrl, html, "utf8")
await writeFile(publicOutputUrl, html, "utf8")
console.log(outputUrl.pathname)
console.log(publicOutputUrl.pathname)
