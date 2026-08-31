import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("src");

const checks = [
  { pattern: /href="#"/, message: "dead href found" },
  { pattern: /\balert\s*\(/, message: "browser alert found" },
  { pattern: /\bconsole\.(log|error)\s*\(/, message: "browser console log/error found" },
  { pattern: /coming soon/i, message: "unfinished coming soon copy found" },
  { pattern: /\b(TODO|mock|dummy|lorem)\b/i, message: "placeholder marker found" },
  { pattern: /â/, message: "mojibake character found" },
  { pattern: /\beventDate\b|\bpublishedDate\b/, message: "legacy date field found" }
];

const collectFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath));
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
};

const files = await collectFiles(root);
const failures = [];

for (const file of files) {
  const source = await readFile(file, "utf8");
  const lines = source.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    for (const check of checks) {
      if (check.pattern.test(lines[index])) {
        failures.push(`${path.relative(process.cwd(), file)}:${index + 1} ${check.message}`);
      }
    }
  }
}

if (failures.length) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exit(1);
}

process.stdout.write("client source audit ok\n");
