/** Sort named bindings inside one import declaration. */
function sortImportSpecifiers(node) {
  if (node.type !== "ImportDeclaration" || !node.specifiers?.length) return
  node.specifiers.sort((a, b) => a.local.name.localeCompare(b.local.name))
}

/** Sort specifiers on every import in the program; does not reorder declarations. */
function sortImportSpecifiersInProgram(ast) {
  if (!ast?.body) return
  for (const node of ast.body) {
    if (node.type === "ImportDeclaration") sortImportSpecifiers(node)
  }
}

function compareImportDeclarations(a, b) {
  const a_specifier = a.specifiers.length ? a.specifiers[0].local : { name: "" }
  const b_specifier = b.specifiers.length ? b.specifiers[0].local : { name: "" }
  if (
    a_specifier.name &&
    a.specifiers[0].type === "ImportNamespaceSpecifier" &&
    (!b_specifier.name || b.specifiers[0].type !== "ImportNamespaceSpecifier")
  ) {
    return -1
  }
  if (
    b_specifier.name &&
    b.specifiers[0].type === "ImportNamespaceSpecifier" &&
    (!a_specifier.name || a.specifiers[0].type !== "ImportNamespaceSpecifier")
  ) {
    return 1
  }
  if (!a_specifier.name && b_specifier.name) return 1
  if (a_specifier.name && !b_specifier.name) return -1

  if (a.specifiers.length < 2 && b.specifiers.length >= 2) return -1
  if (a.specifiers.length >= 2 && b.specifiers.length < 2) return 1

  return a_specifier.name.localeCompare(b_specifier.name)
}

export { compareImportDeclarations, sortImportSpecifiers, sortImportSpecifiersInProgram }
