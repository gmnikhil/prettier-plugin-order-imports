import * as estreePlugin from "prettier/plugins/estree.mjs";
import { doc } from "prettier";

const originalPrint = estreePlugin.printers.estree.print;

/** True when `body[prevIndex]` is an import and no later statement is an import. */
function isLastImportDeclarationInProgram(body, prevIndex) {
  const prev = body[prevIndex];
  if (prev?.type !== "ImportDeclaration") return false;
  for (let j = prevIndex + 1; j < body.length; j++) {
    if (body[j]?.type === "ImportDeclaration") return false;
  }
  return true;
}

/**
 * True if original source already has a blank line between two adjacent statements.
 * Requires non-overlapping ranges (same order as in the file); otherwise returns false.
 */
function alreadyHasBlankLineInSource(text, prev, next) {
  if (typeof text !== "string" || prev?.range == null || next?.range == null)
    return false;
  const prevEnd = prev.range[1];
  const nextStart = next.range[0];
  if (prevEnd > nextStart) return false;
  const between = text.slice(prevEnd, nextStart);
  return /\r?\n\s*\r?\n/.test(between);
}

/**
 * One blank line after the final import in the program (e.g. before `export const …`)
 * when the source is tight there. Skips when another import follows later in the file
 * so `import` → `const` → `import` does not get a blank after the first import only.
 */
function print(path, options, print, ...args) {
  const parent = path.getParentNode();
  const index = path.getName();
  if (parent?.type === "Program" && typeof index === "number" && index > 0) {
    const body = parent.body;
    const prev = body[index - 1];
    const node = path.getValue();
    if (
      prev?.type === "ImportDeclaration" &&
      node?.type !== "ImportDeclaration" &&
      isLastImportDeclarationInProgram(body, index - 1)
    ) {
      if (alreadyHasBlankLineInSource(options.originalText, prev, node)) {
        return originalPrint(path, options, print, ...args);
      }
      return [
        doc.builders.hardline,
        originalPrint(path, options, print, ...args),
      ];
    }
  }
  return originalPrint(path, options, print, ...args);
}

export const printers = {
  estree: {
    ...estreePlugin.printers.estree,
    print,
  },
};
