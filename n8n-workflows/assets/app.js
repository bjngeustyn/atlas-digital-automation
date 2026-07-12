const state = {
  manifest: null,
  workflows: [],
  query: "",
  status: "all",
};

const grid = document.querySelector("#workflowGrid");
const emptyState = document.querySelector("#emptyState");
const template = document.querySelector("#workflowCardTemplate");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const workflowCount = document.querySelector("#workflowCount");
const nodeCount = document.querySelector("#nodeCount");
const updatedAt = document.querySelector("#updatedAt");

async function loadManifest() {
  try {
    const response = await fetch("workflows/index.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Manifest request failed: ${response.status}`);
    }
    state.manifest = await response.json();
    state.workflows = Array.isArray(state.manifest.workflows) ? state.manifest.workflows : [];
  } catch (error) {
    console.error(error);
    state.manifest = { generatedAt: null, workflows: [] };
    state.workflows = [];
  }

  render();
}

function render() {
  const filtered = state.workflows.filter((workflow) => {
    const haystack = [
      workflow.name,
      workflow.id,
      workflow.status,
      ...(workflow.tags || []),
      ...(workflow.nodes || []),
      ...(workflow.triggers || []),
    ].join(" ").toLowerCase();

    return haystack.includes(state.query) && (state.status === "all" || workflow.status === state.status);
  });

  workflowCount.textContent = String(filtered.length);
  nodeCount.textContent = String(filtered.reduce((sum, workflow) => sum + (workflow.nodeCount || 0), 0));
  updatedAt.textContent = formatDate(state.manifest?.generatedAt);

  grid.replaceChildren(...filtered.map(createCard));
  emptyState.hidden = filtered.length > 0;
}

function createCard(workflow) {
  const card = template.content.firstElementChild.cloneNode(true);
  const title = card.querySelector("h2");
  const status = card.querySelector(".status");
  const meta = card.querySelector(".meta");
  const nodeList = card.querySelector(".node-list");
  const openLink = card.querySelector(".open-link");
  const copyButton = card.querySelector(".copy-button");

  title.textContent = workflow.name || "Untitled workflow";
  status.textContent = workflow.status || "inactive";
  status.classList.toggle("inactive", workflow.status !== "active");
  meta.textContent = [
    workflow.nodeCount ? `${workflow.nodeCount} nodes` : "No nodes indexed",
    workflow.updatedAt ? `Updated ${formatDate(workflow.updatedAt)}` : null,
    workflow.file,
  ].filter(Boolean).join(" | ");

  nodeList.replaceChildren(...(workflow.nodes || []).slice(0, 8).map((name) => {
    const item = document.createElement("span");
    item.textContent = name;
    return item;
  }));

  openLink.href = workflow.file;
  openLink.target = "_blank";
  openLink.rel = "noreferrer";
  copyButton.addEventListener("click", () => copyWorkflow(workflow.file, copyButton));

  return card;
}

async function copyWorkflow(file, button) {
  const originalText = button.textContent;

  try {
    const response = await fetch(file, { cache: "no-store" });
    const text = await response.text();
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied";
  } catch (error) {
    console.error(error);
    button.textContent = "Copy failed";
  }

  window.setTimeout(() => {
    button.textContent = originalText;
  }, 1600);
}

function formatDate(value) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value.trim().toLowerCase();
  render();
});

statusFilter.addEventListener("change", (event) => {
  state.status = event.target.value;
  render();
});

loadManifest();
