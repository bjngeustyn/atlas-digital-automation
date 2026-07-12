import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workflowDir = path.join(rootDir, "workflows");

const files = (await readdir(workflowDir))
  .filter((file) => file.endsWith(".json") && file !== "index.json")
  .sort((a, b) => a.localeCompare(b));

const workflows = [];

for (const file of files) {
  const filePath = path.join(workflowDir, file);
  const raw = await readFile(filePath, "utf8");
  const workflow = JSON.parse(raw);
  const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
  const tags = Array.isArray(workflow.tags)
    ? workflow.tags.map((tag) => tag.name || tag).filter(Boolean)
    : [];

  workflows.push({
    id: workflow.id || path.basename(file, ".json"),
    name: workflow.name || path.basename(file, ".json"),
    status: workflow.active ? "active" : "inactive",
    file: `workflows/${file}`,
    updatedAt: workflow.updatedAt || workflow.modifiedAt || null,
    nodeCount: nodes.length,
    nodes: nodes.map((node) => node.name || node.type).filter(Boolean),
    triggers: nodes
      .filter((node) => String(node.type || "").toLowerCase().includes("trigger"))
      .map((node) => node.name || node.type)
      .filter(Boolean),
    tags,
  });
}

const manifest = {
  generatedAt: new Date().toISOString(),
  workflows,
};

await writeFile(
  path.join(workflowDir, "index.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(`Indexed ${workflows.length} workflows.`);
