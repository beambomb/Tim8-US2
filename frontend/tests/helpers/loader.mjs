import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const helpersDir = path.dirname(fileURLToPath(import.meta.url));
const frontendSrcDir = path.resolve(helpersDir, "../../src");

function resolveWithExtension(basePath) {
  const candidates = [
    basePath,
    `${basePath}.js`,
    `${basePath}.mjs`,
    `${basePath}.jsx`,
    path.join(basePath, "index.js"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return basePath;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = resolveWithExtension(path.join(frontendSrcDir, specifier.slice(2)));
    return nextResolve(pathToFileURL(target).href, context);
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.startsWith(pathToFileURL(frontendSrcDir).href) && url.endsWith(".js")) {
    return {
      ...result,
      format: "module",
      shortCircuit: true,
    };
  }
  return result;
}
