/**
 * Prettier infers extra blank lines from gaps in the original source text using
 * each statement's `range` / `loc`. After reordering imports, those positions
 * still point at the old locations, which makes blank lines show up between
 * imports. Clearing positions on each `ImportDeclaration` node (only the
 * declaration itself, not specifiers or `source`) resets that while keeping
 * inner ranges intact so comments and `import { x }` printing stay valid.
 */
function stripImportDeclarationPosition(node) {
  if (!node || node.type !== "ImportDeclaration") return
  delete node.loc
  delete node.range
  delete node.start
  delete node.end
}

export { stripImportDeclarationPosition }
