import * as estreePlugin from "prettier/plugins/estree.mjs"
import { doc } from "prettier"

const originalPrint = estreePlugin.printers.estree.print

/** One extra newline so there is a single blank line after the import block. */
function print(path, options, print, ...args) {
  const parent = path.getParentNode()
  const index = path.getName()
  if (parent?.type === "Program" && typeof index === "number" && index > 0) {
    const prev = parent.body[index - 1]
    const node = path.getValue()
    if (prev?.type === "ImportDeclaration" && node?.type !== "ImportDeclaration") {
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
