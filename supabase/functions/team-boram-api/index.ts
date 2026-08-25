const NOTION_VERSION = "2026-03-11";
const LIVE_WORK_DATA_SOURCE = Deno.env.get("NOTION_LIVE_WORK_DS") || "3e18fc30-88d9-4b7a-b0aa-00ff4055f66c";
const PORTFOLIO_DATA_SOURCE = Deno.env.get("NOTION_PORTFOLIO_DS") || "0724ff88-9efb-4852-a782-4aeb87555e3e";
const NOTION_TOKEN = Deno.env.get("NOTION_TOKEN") || "";
const DASHBOARD_KEY = Deno.env.get("TEAM_BORAM_DASHBOARD_KEY") || "";
const ALLOWED_ORIGINS = new Set((Deno.env.get("TEAM_BORAM_ALLOWED_ORIGINS") || "https://bb-bk-tk.github.io,http://localhost:8000,http://127.0.0.1:8000").split(",").map((x) => x.trim()).filter(Boolean));

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://bb-bk-tk.github.io";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "content-type,x-dashboard-key",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
}

function textProp(prop: any) {
  if (!prop) return "";
  const items = prop.title || prop.rich_text || [];
  return items.map((x: any) => x.plain_text || x.text?.content || "").join("");
}
function selectProp(prop: any) { return prop?.select?.name || prop?.status?.name || ""; }
function dateProp(prop: any) { return prop?.date?.start || null; }
function relationProp(prop: any) { return (prop?.relation || []).map((x: any) => x.id); }
function normalizeId(value: string) { return String(value || "").replace(/-/g, "").toLowerCase(); }

async function notion(path: string, init: RequestInit = {}) {
  if (!NOTION_TOKEN) throw new Error("NOTION_TOKEN is not configured");
  const response = await fetch(`https://api.notion.com${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Notion ${response.status}: ${body?.message || "request failed"}`);
  return body;
}

async function queryDataSource(dataSourceId: string) {
  const rows: any[] = [];
  let cursor: string | undefined;
  do {
    const payload: Record<string, unknown> = { page_size: 100 };
    if (cursor) payload.start_cursor = cursor;
    const page = await notion(`/v1/data_sources/${dataSourceId}/query`, { method: "POST", body: JSON.stringify(payload) });
    rows.push(...(page.results || []));
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);
  return rows;
}

function stageFor(status: string) {
  if (["Hold", "Out of scope"].includes(status)) return "PARKED";
  if (status === "Creative cadence") return "CADENCE";
  if (status === "Light experiment") return "TESTING";
  return "NOW";
}

function normalizeRole(role: string) {
  if (["Venture Lab", "Build & Experiment Desk", "Venture & Build"].includes(role)) return "Venture & Build";
  return role;
}

function parseDecisionOptions(raw: string) {
  if (!raw) return [];
  return raw.split("|").map((part) => part.trim()).filter(Boolean).map((part) => {
    const match = part.match(/^([A-Z0-9]+)[).:]?\s*(.*)$/i);
    const body = match ? match[2].trim() : part;
    const pieces = body.split(/\s+[—-]\s+/);
    return { value: body, label: pieces[0] || body, detail: pieces.slice(1).join(" — ") };
  });
}

function projectRow(page: any) {
  const p = page.properties || {};
  const status = selectProp(p["Status"]);
  return {
    id: page.id,
    project: textProp(p["Project"]),
    portfolio: selectProp(p["Portfolio"]),
    status,
    stage: stageFor(status),
    currentFocus: textProp(p["Current Focus"]),
    nextDecision: textProp(p["Next Decision"]),
    approvalGate: selectProp(p["Approval Gate"]),
    lastReview: dateProp(p["Last Review"]) || dateProp(p["date:Last Review:start"]),
  };
}

function liveWorkRow(page: any, portfolioMap: Map<string, any>) {
  const p = page.properties || {};
  const relationIds = relationProp(p["Project"]);
  const linkedProjects = relationIds.map((id: string) => portfolioMap.get(normalizeId(id))).filter(Boolean);
  return {
    id: page.id,
    workItem: textProp(p["Work Item"]),
    teamRole: normalizeRole(selectProp(p["Team Role"])),
    originalTeamRole: selectProp(p["Team Role"]),
    status: selectProp(p["Status"]),
    executionMode: selectProp(p["Execution Mode"]),
    output: textProp(p["Today / Output"]),
    lastUpdated: dateProp(p["Last Updated"]),
    nextCheckin: dateProp(p["Next Check-in"]),
    approvalGate: selectProp(p["Approval Gate"]),
    recommended: textProp(p["Recommended Option"]),
    options: parseDecisionOptions(textProp(p["Decision Options"])),
    founderDecision: textProp(p["Founder Decision"]),
    decisionNote: textProp(p["Decision Note"]),
    decisionUpdated: dateProp(p["Decision Updated"]),
    projects: linkedProjects,
  };
}

function agentStatus(items: any[]) {
  if (items.some((x) => x.status === "Blocked")) return "BLOCKED";
  if (items.some((x) => x.executionMode === "Autonomous" && x.status === "In progress")) return "ACTIVE";
  if (items.some((x) => x.executionMode === "Needs BoRam" || x.status === "Waiting for BoRam")) return "WAITING";
  return "IDLE";
}

async function buildDashboard() {
  const [portfolioPages, livePages] = await Promise.all([queryDataSource(PORTFOLIO_DATA_SOURCE), queryDataSource(LIVE_WORK_DATA_SOURCE)]);
  const portfolio = portfolioPages.map(projectRow).filter((p) => p.status !== "Out of scope");
  const portfolioMap = new Map(portfolioPages.map((page) => [normalizeId(page.id), projectRow(page)]));
  const liveWork = livePages.map((page) => liveWorkRow(page, portfolioMap)).filter((row) => row.status !== "Done");

  const agentNames = ["Founder Partner / CoS", "Venture & Build", "Content & IP Studio", "Personal Platform", "Opportunity & Insight Scout"];
  const agents = agentNames.map((name) => {
    const items = liveWork.filter((item) => item.teamRole === name);
    const status = agentStatus(items);
    const active = items.find((x) => x.executionMode === "Autonomous" && x.status === "In progress") || items[0];
    return { name, status, summary: active?.output || "No current Live Work assigned.", items };
  });

  const founderQueue = liveWork.filter((x) => (x.executionMode === "Needs BoRam" || x.status === "Waiting for BoRam") && !x.founderDecision);
  const now = new Date();
  const staleOrBlocked = liveWork.filter((x) => {
    const stale = x.nextCheckin && new Date(x.nextCheckin).getTime() < now.getTime();
    return stale || x.status === "Blocked";
  }).map((x) => ({ ...x, reason: x.status === "Blocked" ? "BLOCKED" : "STALE CHECK-IN" }));
  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      totalAgents: agents.length,
      workingAgents: agents.filter((a) => a.status === "ACTIVE").length,
      openDecisions: founderQueue.length,
      staleOrBlocked: staleOrBlocked.length,
    },
    agents,
    founderQueue,
    portfolio,
    staleOrBlocked,
  };
}

function richText(content: string) {
  return { rich_text: content ? [{ type: "text", text: { content: content.slice(0, 1900) } }] : [] };
}

async function ensureLiveWorkPage(pageId: string) {
  const rows = await queryDataSource(LIVE_WORK_DATA_SOURCE);
  const wanted = normalizeId(pageId);
  if (!rows.some((row) => normalizeId(row.id) === wanted)) throw new Error("Work item is not in Team BoRam Live Work");
}

async function patchPage(pageId: string, properties: Record<string, unknown>) {
  return notion(`/v1/pages/${pageId}`, { method: "PATCH", body: JSON.stringify({ properties }) });
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: "Origin not allowed" }, 403, origin);
  if (!DASHBOARD_KEY) return json({ error: "TEAM_BORAM_DASHBOARD_KEY is not configured" }, 500, origin);
  if (req.headers.get("X-Dashboard-Key") !== DASHBOARD_KEY) return json({ error: "Invalid dashboard key" }, 401, origin);

  const url = new URL(req.url);
  try {
    if (req.method === "GET" && url.pathname.endsWith("/dashboard")) {
      return json(await buildDashboard(), 200, origin);
    }

    if (req.method === "POST" && url.pathname.endsWith("/decision")) {
      const body = await req.json();
      const workItemId = String(body.workItemId || "");
      const decision = String(body.decision || "").trim();
      const note = String(body.note || "").trim();
      if (!workItemId || !decision) return json({ error: "workItemId and decision are required" }, 400, origin);
      await ensureLiveWorkPage(workItemId);
      const properties: Record<string, unknown> = {
        "Founder Decision": richText(decision),
        "Decision Note": richText(note),
        "Decision Updated": { date: { start: new Date().toISOString() } },
      };
      if (body.unlock === true) {
        properties["Execution Mode"] = { select: { name: "Autonomous" } };
        properties["Status"] = { select: { name: "In progress" } };
      }
      await patchPage(workItemId, properties);
      return json({ ok: true }, 200, origin);
    }

    if (req.method === "POST" && url.pathname.endsWith("/mode")) {
      const body = await req.json();
      const workItemId = String(body.workItemId || "");
      const mode = String(body.mode || "");
      if (!workItemId || !["Autonomous", "Needs BoRam", "Parked"].includes(mode)) return json({ error: "Valid workItemId and mode are required" }, 400, origin);
      await ensureLiveWorkPage(workItemId);
      const properties: Record<string, unknown> = { "Execution Mode": { select: { name: mode } } };
      if (mode === "Parked") properties["Status"] = { select: { name: "Ready" } };
      if (mode === "Autonomous") properties["Status"] = { select: { name: "In progress" } };
      await patchPage(workItemId, properties);
      return json({ ok: true }, 200, origin);
    }

    return json({ error: "Not found" }, 404, origin);
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500, origin);
  }
});
