import * as estreePlugin from "prettier/plugins/estree.mjs"
import { doc } from "prettier"

const originalPrint = estreePlugin.printers.estree.print

/** True if original source already has a blank line between these two statements. */
function alreadyHasBlankLineBetween(text, prev, next) {
  if (typeof text !== "string" || prev?.range == null || next?.range == null) return false
  const between = text.slice(prev.range[1], next.range[0])
  return /\r?\n\s*\r?\n/.test(between)
}

/** One extra newline after the import block when the file was tight (no blank yet). */
function print(path, options, print, ...args) {
  const parent = path.getParentNode()
  const index = path.getName()
  if (parent?.type === "Program" && typeof index === "number" && index > 0) {
    const prev = parent.body[index - 1]
    const node = path.getValue()
    if (prev?.type === "ImportDeclaration" && node?.type !== "ImportDeclaration") {
      if (alreadyHasBlankLineBetween(options.originalText, prev, node)) {
        return originalPrint(path, options, print, ...args)
      }
      return [doc.builders.hardline, originalPrint(path, options, print, ...args)]
    }
  }
  return originalPrint(path, options, print, ...args)
}

export const printers = {
  estree: {
    ...estreePlugin.printers.estree,
    print,
  },
}
