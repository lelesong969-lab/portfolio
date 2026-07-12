import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import publicOutputRules from "./public-output-rules.cjs";

export const { forbiddenPatterns } = publicOutputRules;

export const DEFAULT_SCAN_ROOTS = [
  "src/content",
  ".next/server/app",
  ".next/server/chunks",
  ".next/static",
  "public",
];

const TEXT_EXTENSIONS = new Set([
  ".body",
  ".cjs",
  ".css",
  ".htm",
  ".html",
  ".js",
  ".jsx",
  ".json",
  ".mjs",
  ".rsc",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
]);

export function isScannableTextFile(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function findForbiddenMatches(content) {
  return forbiddenPatterns
    .filter(({ pattern }) => pattern.test(content))
    .map(({ label }) => ({ label }));
}

function ensureInsideWorkspace(cwd, targetPath) {
  const relative = path.relative(cwd, targetPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`scan root escapes workspace: ${targetPath}`);
  }
}

async function collectTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`symbolic link is not allowed in scan roots: ${entryPath}`);
    }
    if (entry.isDirectory()) {
      files.push(...(await collectTextFiles(entryPath)));
    } else if (entry.isFile() && isScannableTextFile(entryPath)) {
      files.push(entryPath);
    }
  }

  return files;
}

function lineNumberFor(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

export async function scanPublicOutput({ cwd = process.cwd(), roots = DEFAULT_SCAN_ROOTS } = {}) {
  const absoluteCwd = path.resolve(cwd);
  const files = [];

  for (const root of roots) {
    const absoluteRoot = path.resolve(absoluteCwd, root);
    ensureInsideWorkspace(absoluteCwd, absoluteRoot);

    let rootStat;
    try {
      rootStat = await stat(absoluteRoot);
    } catch {
      throw new Error(`missing scan root: ${root}`);
    }
    if (!rootStat.isDirectory()) {
      throw new Error(`scan root is not a directory: ${root}`);
    }

    files.push(...(await collectTextFiles(absoluteRoot)));
  }

  const matches = [];
  for (const filePath of files) {
    const content = await readFile(filePath, "utf8");
    for (const { label, pattern } of forbiddenPatterns) {
      const match = pattern.exec(content);
      if (match) {
        matches.push({
          file: path.relative(absoluteCwd, filePath).replaceAll(path.sep, "/"),
          label,
          line: lineNumberFor(content, match.index),
        });
      }
    }
  }

  return {
    matches,
    scannedRoots: roots.length,
    scannedTextFiles: files.length,
  };
}

async function main() {
  try {
    const result = await scanPublicOutput();
    console.log(`scanned_roots=${result.scannedRoots}`);
    console.log(`scanned_text_files=${result.scannedTextFiles}`);
    for (const match of result.matches) {
      console.error(`${match.file}:${match.line} forbidden=${match.label}`);
    }
    console.log(`forbidden_public_matches=${result.matches.length}`);
    if (result.matches.length > 0) process.exitCode = 1;
  } catch (error) {
    console.error(`public_scan_error=${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

const entryPoint = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (entryPoint === import.meta.url) {
  await main();
}
