/**
 * Stripping `range`/`loc` from `ImportDeclaration` breaks Prettier when a line
 * comment sits in the gap between imports (still in `ast.comments`, not on the
 * node). Skip stripping in that case so comments stay attachable.
 */
function hasFloatingCommentsInImportRegion(ast) {
  const body = ast.body
  const comments = ast.comments
  if (!comments?.length) return false

  const importIndices = []
  for (let i = 0; i < body.length; i++) {
    if (body[i].type === "ImportDeclaration") importIndices.push(i)
  }
  if (importIndices.length === 0) return false

  for (let k = 0; k < importIndices.length - 1; k++) {
    const left = body[importIndices[k]]
    const right = body[importIndices[k + 1]]
    if (
      comments.some(
        (c) => c.range[0] >= left.range[1] && c.range[1] <= right.range[0],
      )
    ) {
      return true
    }
  }

  const lastIdx = importIndices[importIndices.length - 1]
  const last = body[lastIdx]
  const after = body[lastIdx + 1]
  if (after && after.type !== "ImportDeclaration") {
    if (
      comments.some(
        (c) => c.range[0] >= last.range[1] && c.range[1] <= after.range[0],
      )
    ) {
      return true
    }
  }

  return false
}

export { hasFloatingCommentsInImportRegion }
