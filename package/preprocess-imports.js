import {
  compareImportDeclarations,
  sortImportSpecifiers,
} from "./import-sort-logic.js"

/**
 * Comments that sit between import lines (not fully inside one declaration's
 * range) cannot be preserved when we rebuild the import block from sorted
 * slices, so we skip text reorder in that case.
 */
function hasCommentBetweenTopImportBlock(ast, imports, blockStart, blockEnd) {
  for (const c of ast.comments ?? []) {
    const s = c.range[0]
    const e = c.range[1]
    if (e <= blockStart || s >= blockEnd) continue
    const fullyInsideOneImport = imports.some(
      (imp) => s >= imp.range[0] && e <= imp.range[1],
    )
    if (!fullyInsideOneImport) return true
  }
  return false
}

/**
 * When every import is a contiguous prefix of `Program.body`, rewrite that
 * region of the source so declaration order matches sort order. AST ranges
 * then match the text and Prettier can attach comments safely.
 */
function preprocessImportsInSource(text, options, baseParse) {
  let ast
  try {
    ast = baseParse(text, options)
  } catch {
    return text
  }

  const body = ast.body
  const imports = body.filter((n) => n.type === "ImportDeclaration")
  if (imports.length < 2) return text

  let leadingImportCount = 0
  for (let i = 0; i < body.length; i++) {
    if (body[i].type !== "ImportDeclaration") break
    leadingImportCount++
  }

  if (leadingImportCount !== imports.length) return text

  const leading = body.slice(0, leadingImportCount)
  for (const node of leading) sortImportSpecifiers(node)

  const sorted = [...leading].sort(compareImportDeclarations)
  const alreadyOrdered = sorted.every((node, i) => node === leading[i])
  if (alreadyOrdered) return text

  const blockStart = leading[0].range[0]
  const blockEnd = leading[leadingImportCount - 1].range[1]

  if (hasCommentBetweenTopImportBlock(ast, leading, blockStart, blockEnd)) {
    return text
  }

  const newBlock = sorted.map((node) => text.slice(node.range[0], node.range[1])).join("\n")

  return text.slice(0, blockStart) + newBlock + text.slice(blockEnd)
}

export { preprocessImportsInSource }
