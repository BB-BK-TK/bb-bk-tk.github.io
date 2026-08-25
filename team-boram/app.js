"use strict";

(function () {
  const config = window.TEAM_BORAM_CONFIG || {};
  const apiBase = String(config.apiBase || "").replace(/\/$/, "");
  const state = { key: "", data: null, selectedAgent: null, selectedDecision: {} };

  const $ = (id) => document.getElementById(id);
  const lockScreen = $("lockScreen");
  const dashboard = $("dashboard");
  const lockMessage = $("lockMessage");

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

  const avatarMap = {
    "Founder Partner / CoS": "🧭",
    "Venture & Build": "🛠️",
    "Content & IP Studio": "🎨",
    "Personal Platform": "🌐",
    "Opportunity & Insight Scout": "🔎"
  };

  function statusClass(status) {
    const s = String(status || "").toUpperCase();
    if (s === "ACTIVE") return "status-active";
    if (s === "WAITING") return "status-waiting";
    if (s === "BLOCKED") return "status-blocked";
    return "status-idle";
  }

  function renderAgents() {
    const grid = $("agentGrid");
    grid.innerHTML = "";
    state.data.agents.forEach((agent) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "agent-card" + (state.selectedAgent === agent.name ? " selected" : "");
      button.innerHTML = `
        <span class="status-dot ${statusClass(agent.status)}"></span>
        <div class="agent-avatar">${avatarMap[agent.name] || "🤖"}</div>
        <b>${escapeHtml(agent.name)}</b>
        <small>${escapeHtml(agent.summary || "No active work")}</small>`;
      button.addEventListener("click", () => { state.selectedAgent = agent.name; renderAgents(); renderAgentDetail(agent); });
      grid.appendChild(button);
    });
    if (state.selectedAgent) {
      const selected = state.data.agents.find((a) => a.name === state.selectedAgent);
      if (selected) renderAgentDetail(selected);
    }
  }

  function renderAgentDetail(agent) {
    const detail = $("agentDetail");
    detail.hidden = false;
    const rows = agent.items.length ? agent.items.map((item) => `
      <div class="mini-row"><b>${escapeHtml(item.workItem)}</b>${escapeHtml(item.output || "No recent output")}<br><span class="muted">${escapeHtml(item.executionMode || "Unassigned")} · next ${escapeHtml(item.nextCheckin || "not set")}</span></div>`).join("") : `<div class="empty">No Live Work assigned.</div>`;
    detail.innerHTML = `
      <div class="detail-title"><div class="agent-avatar">${avatarMap[agent.name] || "🤖"}</div><div><h3>${escapeHtml(agent.name)}</h3><div class="muted">${escapeHtml(agent.status)} · ${agent.items.length} work item(s)</div></div></div>
      <div class="label">What is happening</div><p class="copy">${escapeHtml(agent.summary || "No current work.")}</p>
      <div class="label">Live Work</div><div class="stack">${rows}</div>`;
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
