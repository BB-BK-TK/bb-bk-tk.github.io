"use strict";

(function () {
  const exact = new Map([
    ["Notion Live Work와 연결된 private dashboard입니다.", "팀이 지금 어디까지 와 있는지, 내가 뭘 정해야 하는지 한눈에 보는 곳이에요."],
    ["Dashboard key", "접속 키"],
    ["Open Control Tower", "Control Tower 열기"],
    ["Loading…", "불러오는 중…"],
    ["specialists active", "명 지금 움직이는 중"],
    ["decisions open", "개 보람 결정 필요"],
    ["stale / blocked", "개 멈추거나 지연"],
    ["Team", "팀"],
    ["Decisions", "내 결정"],
    ["Projects", "프로젝트"],
    ["Stale", "막힌 일"],
    ["Team Structure", "지금 팀은 이렇게 움직이고 있어요"],
    ["Founder → Orchestrator → Specialists", "보람이 방향을 정하면, Orchestrator가 필요한 사람에게 일을 넘깁니다"],
    ["sets direction & approvals", "방향과 최종 결정은 보람이"],
    ["routes & coordinates work", "그다음 실행은 Orchestrator가 연결"],
    ["5 SPECIALIST AGENTS", "5명의 전문 에이전트"],
    ["Tap any role to inspect", "누르면 지금 뭘 하는지 볼 수 있어요"],
    ["Founder Queue", "보람이 지금 정해주면 되는 것"],
    ["Max 3", "한 번에 3개까지만"],
    ["Portfolio Map", "프로젝트는 지금 이렇게 돌아가고 있어요"],
    ["Now / Testing / Cadence / Parked", "집중 / 테스트 / 반복 운영 / 잠시 멈춤"],
    ["Stale / Blocked", "멈춰 있거나 오래된 일"],
    ["Needs cleanup", "한번 정리할 필요가 있어요"],
    ["Mission", "내 역할"],
    ["What I'm working on now", "지금 보고 있는 일"],
    ["Projects I own", "내가 맡고 있는 프로젝트"],
    ["What I need to decide", "보람이 정해줘야 할 것"],
    ["Next action", "다음에 하면 되는 것"],
    ["Projects I coordinate", "내가 조율하는 범위"],
    ["Latest team movement", "지금 팀에서 움직이는 것"],
    ["What I need from BoRam", "보람에게 필요한 것"],
    ["Next autonomous action", "내가 다음으로 할 일"],
    ["Latest output", "최근 나온 것"],
    ["Live Work", "지금 맡은 일"],
    ["Founder · final approval layer", "최종 방향과 승인만 잡으면 됩니다"],
    ["Nothing needs your decision right now.", "지금은 보람이 결정할 일이 없어요."],
    ["No action required. Let the team keep running.", "지금은 손대지 않아도 돼요. 팀이 계속 움직이게 둘게요."],
    ["No specialist is actively executing right now.", "지금 바로 움직이고 있는 전문 에이전트는 없어요."],
    ["Nothing right now. Approval gates are clear.", "지금 보람에게 필요한 건 없어요. 막힌 승인도 없습니다."],
    ["Continue Autonomous work, leave Parked work alone, and surface only a real decision, blocker, safety issue, or material recommendation change.", "지금 굴러가는 일은 계속 밀고, 멈춰둔 일은 건드리지 않을게요. 정말 결정이 필요하거나 막힌 일, 안전 이슈, 추천이 바뀐 경우만 보람에게 올리겠습니다."],
    ["No active work", "지금 맡아 움직이는 일은 없어요"],
    ["No current work.", "지금 진행 중인 일은 없어요."],
    ["No linked projects", "연결된 프로젝트가 없어요"],
    ["No recent output.", "아직 새로 나온 결과는 없어요."],
    ["Nothing right now.", "지금은 없어요."],
    ["No autonomous action is currently queued.", "지금 제가 따로 이어서 할 일은 없어요."],
    ["No Live Work assigned.", "지금 배정된 일은 없어요."],
    ["0 — Team is running. No founder decision required.", "지금 보람이 결정할 건 없어요. 팀은 계속 움직이고 있습니다."],
    ["Decision needed", "여기서 하나만 정하면 앞으로 갑니다"],
    ["Approve recommendation", "추천안대로 가기"],
    ["Save & unlock agent", "이대로 결정하고 계속 진행"],
    ["Park", "지금은 멈춰두기"],
    ["No current focus", "지금 따로 집중하고 있는 일은 없어요"],
    ["No projects", "여기에는 지금 프로젝트가 없어요"],
    ["Nothing stale or blocked.", "좋아요. 지금 오래 멈춰 있거나 막힌 일은 없어요."],
    ["No recent output", "아직 새로 나온 결과는 없어요"],
    ["Refreshing Notion…", "최신 상태를 가져오는 중이에요…"],
    ["Connected to Notion · live data refreshed", "Notion과 연결됐어요 · 방금 최신 상태로 갱신했어요"],
    ["Connecting…", "연결하는 중이에요…"],
    ["Saving to Notion…", "결정을 저장하고 있어요…"],
    ["Updating mode…", "상태를 바꾸고 있어요…"]
  ]);

  const missions = new Map([
    ["Set direction, protect taste and priorities, and make the final calls that only BoRam should make.", "전체 방향과 우선순위를 잡고, 정말 보람만 할 수 있는 결정에만 시간을 씁니다."],
    ["Route work across Team BoRam, protect approval gates, keep autonomous work moving, and surface only real decisions or blockers.", "팀 전체를 보면서 일이 멈추지 않게 연결합니다. 동시에 새 일을 벌이기 전에 지금 일이 실제 증거까지 가고 있는지 보고, 약한 논리나 회피가 보이면 바로 짚겠습니다."],
    ["Keep the founder focused on the highest-leverage decisions: what matters now, what should stop, and what deserves the next 10 hours.", "보람이 가장 중요한 판단에만 시간을 쓰게 합니다. 지금 해야 할 것, 멈춰야 할 것, 다음 10시간을 쓸 가치가 있는 것을 가려냅니다."],
    ["Move product ideas from hypothesis to prototype, QA, test, evidence, and the next decision without turning every idea into a project.", "아이디어를 그냥 프로젝트로 만들지 않습니다. 가설 → 프로토타입 → 실제 테스트 → 증거 → 다음 결정까지 밀어붙입니다."],
    ["Build repeatable content and IP systems, test formats, and turn performance evidence into the next creative move.", "콘텐츠를 많이 만드는 것보다 반복 가능한 포맷을 찾습니다. 실제 반응을 보고 다음 크리에이티브를 정합니다."],
    ["Build and maintain BoRam's personal platform, Binna experiences, analytics, and the infrastructure behind public experiments.", "보람의 개인 플랫폼과 Binna 경험, 분석, 공개 실험에 필요한 기반을 만들고 안정적으로 운영합니다."],
    ["Find external signals, benchmarks, and opportunities only when they can sharpen an active Team BoRam decision.", "자료를 모으기 위해 조사하지 않습니다. 지금 내리는 결정을 더 정확하게 만들 수 있을 때만 외부 신호와 벤치마크를 찾습니다."],
    ["Own this specialist workstream and move it toward evidence and decisions.", "맡은 일을 결과물에서 끝내지 않고, 실제 증거와 다음 결정까지 가져갑니다."]
  ]);

  let applying = false;

  function replaceTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const raw = node.nodeValue;
    const trimmed = raw.trim();
    if (!trimmed) return;

    let next = exact.get(trimmed) || missions.get(trimmed) || trimmed;

    next = next
      .replace(/^Updated\s+/, "마지막 업데이트 ")
      .replace(/^(\d+) DECISION(?:S)? NEEDED$/, "$1개만 결정하면 돼요")
      .replace(/^CLEAR$/, "지금은 할 일 없어요")
      .replace(/^ACTIVE$/, "지금 움직이는 중")
      .replace(/^IDLE$/, "지금은 조용해요")
      .replace(/^WAITING$/, "보람 결정을 기다리는 중")
      .replace(/^BLOCKED$/, "지금 막혀 있어요")
      .replace(/^(\d+) decision(?:s)? are waiting for your call\.$/, "지금 보람이 정해줘야 할 게 $1개 있어요.")
      .replace(/^No founder decision required\. The team can keep moving\.$/, "지금은 보람이 끼어들 일 없어요. 팀이 계속 움직이면 됩니다.")
      .replace(/^(\d+) specialist(?:s)? active · (\d+) founder decisions · (\d+) stale\/blocked\.$/, "지금 $1명이 움직이고 있어요. 보람 결정 $2개, 막히거나 오래된 일 $3개를 보고 있습니다.")
      .replace(/^Resolve (\d+) surfaced founder decision(?:s)?\.$/, "지금 올라온 결정 $1개만 정리하면 됩니다.")
      .replace(/^Stay out of the way unless taste, direction, spending, privacy, or a final approval is required\.$/, "방향, 비용, 프라이버시, 최종 승인처럼 보람만 정할 수 있는 일이 아니면 굳이 끼어들지 않아도 됩니다.")
      .replace(/^Approve, redirect, or park the highest-leverage item in Founder Queue\.$/, "가장 중요한 것부터 하나씩 결정하거나, 방향을 바꾸거나, 지금은 멈춰두면 됩니다.")
      .replace(/^(\d+) item\(s\) are in Founder Queue\.$/, "보람이 정해줘야 할 게 $1개 있어요.")
      .replace(/^System manager · .+$/, "팀 전체를 보면서 막히는 곳을 정리하고 있어요")
      .replace(/^Portfolio · (\d+)$/, "전체 프로젝트 $1개")
      .replace(/^Live specialists · (\d+)$/, "전문 에이전트 $1명")
      .replace(/^Whole portfolio · (\d+) projects$/, "전체 포트폴리오 · 프로젝트 $1개")
      .replace(/^(.+) · (\d+) work item\(s\)$/, "$1 · 맡은 일 $2개")
      .replace(/^(.+) · next (.+)$/, "$1 · 다음 확인 $2")
      .replace(/^Continue “(.+)” · next check-in (.+)\.$/, "“$1”을 계속 진행합니다. 다음 확인은 $2예요.")
      .replace(/^Continue “(.+)”\.$/, "“$1”을 계속 진행합니다.")
      .replace(/^Recommendation · /, "제가 보기엔 · ");

    if (next !== trimmed) {
      node.nodeValue = raw.replace(trimmed, next);
    }
  }

  function walkText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(replaceTextNode);
  }

  function orchestratorNudge() {
    const detail = document.getElementById("agentDetail");
    if (!detail || detail.hidden) return;
    const title = detail.querySelector("h3")?.textContent?.trim();
    if (title !== "Team Orchestrator") return;

    let note = detail.querySelector(".orchestrator-nudge");
    if (!note) {
      note = document.createElement("div");
      note.className = "recommendation orchestrator-nudge";
      detail.querySelector(".detail-title")?.insertAdjacentElement("afterend", note);
    }

    const decisionCount = Number(document.getElementById("decisionCount")?.textContent || 0);
    const staleCount = Number(document.getElementById("staleCount")?.textContent || 0);

    if (decisionCount > 0 && staleCount > 0) {
      note.textContent = `제가 보기엔 지금 새 일을 늘릴 때는 아니에요. 보람 결정 ${decisionCount}개와 막힌 일 ${staleCount}개가 먼저입니다. 하나씩 정리한 뒤 다음 일을 열겠습니다.`;
    } else if (decisionCount > 0) {
      note.textContent = `지금은 새 아이디어보다 결정을 미루지 않는 게 더 중요해요. ${decisionCount}개만 정하면 팀이 다시 더 빨리 움직일 수 있습니다.`;
    } else if (staleCount > 0) {
      note.textContent = `새로 만드는 것보다 오래 멈춘 일 ${staleCount}개를 먼저 보죠. 살릴지, 끝낼지, 계속 멈춰둘지 정하는 게 다음 빌드보다 중요합니다.`;
    } else {
      note.textContent = "지금 큰 경고는 없어요. 새 일을 벌이기보다 이미 움직이는 일이 프로토타입에서 끝나지 않고 실제 사용자 반응과 증거까지 가는지 보겠습니다.";
    }
  }

  function applyHumanCopy() {
    if (applying) return;
    applying = true;
    try {
      walkText(document.body);
      orchestratorNudge();
    } finally {
      applying = false;
    }
  }

  document.addEventListener("DOMContentLoaded", applyHumanCopy);
  const observer = new MutationObserver(() => applyHumanCopy());
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
})();
