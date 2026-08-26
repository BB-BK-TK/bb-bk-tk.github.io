"use strict";

(function () {
  const config = window.TEAM_BORAM_CONFIG || {};
  const apiBase = String(config.apiBase || "").replace(/\/$/, "");
  const state = { key: "", data: null, selectedAgent: null, selectedDecision: {} };

  const $ = (id) => document.getElementById(id);
  const lockScreen = $("lockScreen");
  const dashboard = $("dashboard");
  const lockMessage = $("lockMessage");

  const roleMeta = {
    "BoRam — Founder": {
      avatar: "👑",
      kicker: "FOUNDER",
      mission: "Set direction, protect taste and priorities, and make the final calls that only BoRam should make."
    },
    "Team Orchestrator": {
      avatar: "🎛️",
      kicker: "ORCHESTRATOR",
      mission: "Route work across Team BoRam, protect approval gates, keep autonomous work moving, and surface only real decisions or blockers."
    },
    "Founder Partner / CoS": {
      avatar: "🧭",
      mission: "Keep the founder focused on the highest-leverage decisions: what matters now, what should stop, and what deserves the next 10 hours."
    },
    "Venture & Build": {
      avatar: "🛠️",
      mission: "Move product ideas from hypothesis to prototype, QA, test, evidence, and the next decision without turning every idea into a project."
    },
    "Content & IP Studio": {
      avatar: "🎨",
      mission: "Build repeatable content and IP systems, test formats, and turn performance evidence into the next creative move."
    },
    "Personal Platform": {
      avatar: "🌐",
      mission: "Build and maintain BoRam's personal platform, Binna experiences, analytics, and the infrastructure behind public experiments."
    },
    "Opportunity & Insight Scout": {
      avatar: "🔎",
      mission: "Find external signals, benchmarks, and opportunities only when they can sharpen an active Team BoRam decision."
    }
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'\"]/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'\"':"&quot;"}[ch]));
  }

  function apiHeaders() {
    return { "Content-Type": "application/json", "X-Dashboard-Key": state.key };
  }

  async function api(path, options = {}) {
    if (!apiBase) throw new Error("API URL is not configured.");
    const response = await fetch(apiBase + path, { ...options, headers: { ...apiHeaders(), ...(options.headers || {}) } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
    return payload;
  }

  async function unlock() {
    const key = $("dashboardKey").value.trim();
    if (!key) { lockMessage.textContent = "Dashboard key를 입력해 주세요."; return; }
    state.key = key;
    lockMessage.textContent = "Connecting…";
    try {
      await loadDashboard();
      sessionStorage.setItem("teamBoramKey", key);
      lockScreen.hidden = true;
      dashboard.hidden = false;
      lockMessage.textContent = "";
    } catch (error) {
      state.key = "";
      lockMessage.textContent = error.message;
    }
  }

  function lock() {
    sessionStorage.removeItem("teamBoramKey");
    state.key = "";
    state.data = null;
    dashboard.hidden = true;
    lockScreen.hidden = false;
    $("dashboardKey").value = "";
    lockMessage.textContent = "";
  }

  async function loadDashboard() {
    setHealth("Refreshing Notion…", "");
    const data = await api("/dashboard");
    state.data = data;
    renderAll();
    setHealth("Connected to Notion · live data refreshed", "good");
  }

  function setHealth(text, kind) {
    const el = $("healthStrip");
    el.textContent = text;
    el.className = "health-strip" + (kind ? ` ${kind}` : "");
  }

  function renderAll() {
    const d = state.data;
    $("updatedAt").textContent = `Updated ${new Date(d.generatedAt).toLocaleString()}`;
    $("workingCount").textContent = `${d.metrics.workingAgents}/${d.metrics.totalAgents}`;
    $("decisionCount").textContent = d.metrics.openDecisions;
    $("staleCount").textContent = d.metrics.staleOrBlocked;
    renderAgents();
    renderDecisions();
    renderProjects();
    renderStale();
  }

  function statusClass(status) {
    const s = String(status || "").toUpperCase();
    if (s === "ACTIVE") return "status-active";
    if (s === "WAITING") return "status-waiting";
    if (s === "BLOCKED") return "status-blocked";
    return "status-idle";
  }

  function leadershipRoles() {
    const d = state.data;
    const founderQueue = d.founderQueue || [];
    const founder = {
      name: "BoRam — Founder",
      status: founderQueue.length ? "WAITING" : "IDLE",
      badge: founderQueue.length ? `${founderQueue.length} DECISION${founderQueue.length === 1 ? "" : "S"} NEEDED` : "CLEAR",
      summary: founderQueue.length
        ? `${founderQueue.length} decision${founderQueue.length === 1 ? "" : "s"} are waiting for your call.`
        : "No founder decision required. The team can keep moving."
    };
    const activeCount = d.metrics.workingAgents || 0;
    const pressureCount = (d.metrics.openDecisions || 0) + (d.metrics.staleOrBlocked || 0);
    const orchestrator = {
      name: "Team Orchestrator",
      status: activeCount || pressureCount ? "ACTIVE" : "IDLE",
      badge: activeCount || pressureCount ? "ACTIVE" : "IDLE",
      summary: `${activeCount} specialist${activeCount === 1 ? "" : "s"} active · ${d.metrics.openDecisions || 0} founder decisions · ${d.metrics.staleOrBlocked || 0} stale/blocked.`
    };
    return [founder, orchestrator];
  }

  function renderLeadershipCard(targetId, role, extraClass) {
    const target = $(targetId);
    const meta = roleMeta[role.name] || {};
    const button = document.createElement("button");
    button.type = "button";
    button.className = `leadership-card ${extraClass || ""}` + (state.selectedAgent === role.name ? " selected" : "");
    button.innerHTML = `
      <span class="status-dot ${statusClass(role.status)}"></span>
      <div class="leadership-main">
        <div class="agent-avatar leadership-avatar">${meta.avatar || "🤖"}</div>
        <div class="leadership-copy">
          <span class="role-kicker">${escapeHtml(meta.kicker || "LEADERSHIP")}</span>
          <b>${escapeHtml(role.name)}</b>
          <small>${escapeHtml(role.summary)}</small>
        </div>
      </div>
      <span class="role-badge">${escapeHtml(role.badge)}</span>`;
    button.addEventListener("click", () => {
      state.selectedAgent = role.name;
      renderAgents();
      renderLeadershipDetail(role);
    });
    target.replaceChildren(button);
  }

  function renderAgents() {
    const [founder, orchestrator] = leadershipRoles();
    renderLeadershipCard("founderSlot", founder, "founder-card");
    renderLeadershipCard("orchestratorSlot", orchestrator, "orchestrator-card");

    const grid = $("agentGrid");
    grid.innerHTML = "";
    state.data.agents.forEach((agent) => {
      const meta = roleMeta[agent.name] || {};
      const button = document.createElement("button");
      button.type = "button";
      button.className = "agent-card" + (state.selectedAgent === agent.name ? " selected" : "");
      button.innerHTML = `
        <span class="status-dot ${statusClass(agent.status)}"></span>
        <div class="agent-avatar">${meta.avatar || "🤖"}</div>
        <b>${escapeHtml(agent.name)}</b>
        <small>${escapeHtml(agent.summary || "No active work")}</small>`;
      button.addEventListener("click", () => {
        state.selectedAgent = agent.name;
        renderAgents();
        renderSpecialistDetail(agent);
      });
      grid.appendChild(button);
    });

    if (state.selectedAgent) {
      const leadership = leadershipRoles().find((role) => role.name === state.selectedAgent);
      if (leadership) renderLeadershipDetail(leadership);
      else {
        const selected = state.data.agents.find((a) => a.name === state.selectedAgent);
        if (selected) renderSpecialistDetail(selected);
      }
    }
  }

  function projectNames(items) {
    const names = [];
    items.forEach((item) => (item.projects || []).forEach((project) => {
      if (project?.project && !names.includes(project.project)) names.push(project.project);
    }));
    return names;
  }

  function chipList(values, emptyText) {
    if (!values.length) return `<div class="empty compact">${escapeHtml(emptyText)}</div>`;
    return `<div class="chip-row">${values.map((value) => `<span class="chip">${escapeHtml(value)}</span>`).join("")}</div>`;
  }

  function renderLeadershipDetail(role) {
    const detail = $("agentDetail");
    const meta = roleMeta[role.name] || {};
    detail.hidden = false;

    if (role.name === "BoRam — Founder") {
      const queue = state.data.founderQueue || [];
      const queueText = queue.length
        ? queue.map((item) => `<div class="mini-row"><b>${escapeHtml(item.workItem)}</b>${escapeHtml(item.recommended || item.output || "Decision needed")}</div>`).join("")
        : `<div class="empty compact">Nothing needs your decision right now.</div>`;
      detail.innerHTML = `
        <div class="detail-title"><div class="agent-avatar">${meta.avatar}</div><div><h3>${escapeHtml(role.name)}</h3><div class="muted">Founder · final approval layer</div></div></div>
        <div class="label">Mission</div><p class="copy">${escapeHtml(meta.mission)}</p>
        <div class="label">What I'm working on now</div><p class="copy">${queue.length ? `Resolve ${queue.length} surfaced founder decision${queue.length === 1 ? "" : "s"}.` : "Stay out of the way unless taste, direction, spending, privacy, or a final approval is required."}</p>
        <div class="label">Projects I own</div>${chipList([`Whole portfolio · ${state.data.portfolio.length} projects`], "No portfolio loaded")}
        <div class="label">What I need to decide</div><div class="stack">${queueText}</div>
        <div class="label">Next action</div><p class="copy">${queue.length ? "Approve, redirect, or park the highest-leverage item in Founder Queue." : "No action required. Let the team keep running."}</p>`;
      return;
    }

    const activeAgents = state.data.agents.filter((agent) => agent.status === "ACTIVE");
    const activeText = activeAgents.length
      ? activeAgents.map((agent) => `<div class="mini-row"><b>${escapeHtml(agent.name)}</b>${escapeHtml(agent.summary || "Active work")}</div>`).join("")
      : `<div class="empty compact">No specialist is actively executing right now.</div>`;
    detail.innerHTML = `
      <div class="detail-title"><div class="agent-avatar">${meta.avatar}</div><div><h3>${escapeHtml(role.name)}</h3><div class="muted">System manager · ${escapeHtml(role.status)}</div></div></div>
      <div class="label">Mission</div><p class="copy">${escapeHtml(meta.mission)}</p>
      <div class="label">What I'm working on now</div><p class="copy">${escapeHtml(role.summary)}</p>
      <div class="label">Projects I coordinate</div>${chipList([`Portfolio · ${state.data.portfolio.length}`, `Live specialists · ${state.data.agents.length}`], "No work loaded")}
      <div class="label">Latest team movement</div><div class="stack">${activeText}</div>
      <div class="label">What I need from BoRam</div><p class="copy">${state.data.metrics.openDecisions ? `${state.data.metrics.openDecisions} item(s) are in Founder Queue.` : "Nothing right now. Approval gates are clear."}</p>
      <div class="label">Next autonomous action</div><p class="copy">Continue Autonomous work, leave Parked work alone, and surface only a real decision, blocker, safety issue, or material recommendation change.</p>`;
  }

  function renderSpecialistDetail(agent) {
    const detail = $("agentDetail");
    const meta = roleMeta[agent.name] || {};
    detail.hidden = false;
    const projects = projectNames(agent.items || []);
    const needs = (agent.items || []).filter((item) => item.executionMode === "Needs BoRam" || item.status === "Waiting for BoRam");
    const active = (agent.items || []).find((item) => item.executionMode === "Autonomous" && item.status === "In progress") || agent.items?.[0];
    const workRows = agent.items.length ? agent.items.map((item) => `
      <div class="mini-row"><b>${escapeHtml(item.workItem)}</b>${escapeHtml(item.output || "No recent output")}<br><span class="muted">${escapeHtml(item.executionMode || "Unassigned")} · next ${escapeHtml(item.nextCheckin || "not set")}</span></div>`).join("") : `<div class="empty compact">No Live Work assigned.</div>`;
    const needsText = needs.length
      ? needs.map((item) => item.recommended || item.workItem).join(" · ")
      : "Nothing right now.";
    const nextAction = active && active.executionMode === "Autonomous" && active.status === "In progress"
      ? `Continue “${active.workItem}”${active.nextCheckin ? ` · next check-in ${active.nextCheckin}` : ""}.`
      : "No autonomous action is currently queued.";

    detail.innerHTML = `
      <div class="detail-title"><div class="agent-avatar">${meta.avatar || "🤖"}</div><div><h3>${escapeHtml(agent.name)}</h3><div class="muted">${escapeHtml(agent.status)} · ${agent.items.length} work item(s)</div></div></div>
      <div class="label">Mission</div><p class="copy">${escapeHtml(meta.mission || "Own this specialist workstream and move it toward evidence and decisions.")}</p>
      <div class="label">What I'm working on now</div><p class="copy">${escapeHtml(active?.workItem || "No current work.")}</p>
      <div class="label">Projects I own</div>${chipList(projects, "No linked projects")}
      <div class="label">Latest output</div><p class="copy">${escapeHtml(active?.output || agent.summary || "No recent output.")}</p>
      <div class="label">What I need from BoRam</div><p class="copy">${escapeHtml(needsText)}</p>
      <div class="label">Next autonomous action</div><p class="copy">${escapeHtml(nextAction)}</p>
      <div class="label">Live Work</div><div class="stack">${workRows}</div>`;
  }

  function renderDecisions() {
    const list = $("decisionList");
    list.innerHTML = "";
    const decisions = state.data.founderQueue.slice(0, 3);
    if (!decisions.length) { list.innerHTML = `<div class="empty">0 — Team is running. No founder decision required.</div>`; return; }
    decisions.forEach((decision, index) => {
      const card = document.createElement("article");
      card.className = "decision-card";
      const options = decision.options.length ? decision.options : [{ value: decision.recommended || "Approve recommendation", label: decision.recommended || "Approve recommendation" }];
      const optionsHtml = options.map((option, i) => `
        <button type="button" class="option-btn ${state.selectedDecision[decision.id] === i ? "selected" : ""}" data-option="${i}">
          <b>${escapeHtml(option.label)}</b><span>${escapeHtml(option.detail || "")}</span>
        </button>`).join("");
      card.innerHTML = `
        <div class="decision-head"><div class="decision-num">${index + 1}</div><div><h3>${escapeHtml(decision.workItem)}</h3><p class="copy muted">${escapeHtml(decision.output || "Decision needed")}</p></div></div>
        ${decision.recommended ? `<div class="recommendation">Recommendation · ${escapeHtml(decision.recommended)}</div>` : ""}
        <div class="options">${optionsHtml}</div>
        <textarea placeholder="다른 의견, 조건, 또는 직접 지시…" aria-label="Custom decision note"></textarea>
        <div class="actions"><button type="button" class="primary-btn save-decision">Save & unlock agent</button><button type="button" class="secondary-btn park-work">Park</button></div>
        <div class="inline-status" aria-live="polite"></div>`;
      card.querySelectorAll(".option-btn").forEach((button) => button.addEventListener("click", () => {
        state.selectedDecision[decision.id] = Number(button.dataset.option);
        renderDecisions();
      }));
      card.querySelector(".save-decision").addEventListener("click", () => submitDecision(decision, options, card));
      card.querySelector(".park-work").addEventListener("click", () => setMode(decision, "Parked", card));
      list.appendChild(card);
    });
  }

  async function submitDecision(decision, options, card) {
    const status = card.querySelector(".inline-status");
    const selectedIndex = state.selectedDecision[decision.id];
    const selected = Number.isInteger(selectedIndex) ? options[selectedIndex] : null;
    const note = card.querySelector("textarea").value.trim();
    const decisionText = selected?.value || note;
    if (!decisionText) { status.textContent = "옵션을 선택하거나 직접 의견을 입력해 주세요."; return; }
    status.textContent = "Saving to Notion…";
    try {
      await api("/decision", { method: "POST", body: JSON.stringify({ workItemId: decision.id, decision: decisionText, note, unlock: true }) });
      delete state.selectedDecision[decision.id];
      await loadDashboard();
      switchTab("agentsPanel");
    } catch (error) { status.textContent = error.message; }
  }

  async function setMode(decision, mode, card) {
    const status = card.querySelector(".inline-status");
    status.textContent = "Updating mode…";
    try {
      await api("/mode", { method: "POST", body: JSON.stringify({ workItemId: decision.id, mode }) });
      await loadDashboard();
    } catch (error) { status.textContent = error.message; }
  }

  function renderProjects() {
    const root = $("projectGroups");
    root.innerHTML = "";
    const order = ["NOW", "TESTING", "CADENCE", "PARKED"];
    order.forEach((stage) => {
      const items = state.data.portfolio.filter((p) => p.stage === stage);
      const group = document.createElement("article");
      group.className = "group-card";
      group.innerHTML = `<h3>${stage} · ${items.length}</h3><div class="stack">${items.length ? items.map((p) => `<div class="project-card"><div class="project-meta"><strong>${escapeHtml(p.project)}</strong><span class="stage">${escapeHtml(p.status)}</span></div><p>${escapeHtml(p.currentFocus || p.nextDecision || "No current focus")}</p></div>`).join("") : `<div class="empty">No projects</div>`}</div>`;
      root.appendChild(group);
    });
  }

  function renderStale() {
    const root = $("staleList");
    root.innerHTML = state.data.staleOrBlocked.length ? state.data.staleOrBlocked.map((item) => `
      <article class="stale-card"><div class="project-meta"><strong>${escapeHtml(item.workItem)}</strong><span class="stage">${escapeHtml(item.reason)}</span></div><p>${escapeHtml(item.output || "No recent output")}</p></article>`).join("") : `<div class="empty">Nothing stale or blocked.</div>`;
  }

  function switchTab(panelId) {
    document.querySelectorAll(".panel").forEach((panel) => { panel.hidden = panel.id !== panelId; });
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === panelId));
  }

  $("unlockBtn").addEventListener("click", unlock);
  $("dashboardKey").addEventListener("keydown", (event) => { if (event.key === "Enter") unlock(); });
  $("refreshBtn").addEventListener("click", () => loadDashboard().catch((error) => setHealth(error.message, "bad")));
  $("lockBtn").addEventListener("click", lock);
  document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));

  const remembered = sessionStorage.getItem("teamBoramKey");
  if (remembered) {
    state.key = remembered;
    $("dashboardKey").value = remembered;
    loadDashboard().then(() => { lockScreen.hidden = true; dashboard.hidden = false; }).catch(() => lock());
  }
})();
