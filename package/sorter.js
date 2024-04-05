const sortImportsByComponent = (ast, options) => {
  const imports = ast.body.filter((node) => node.type === "ImportDeclaration")

  const nonImports = ast.body.filter((node) => node.type !== "ImportDeclaration")

  imports.forEach((node) => {
    node.specifiers.sort((a, b) => a.local.name.localeCompare(b.local.name))
  })

  imports.sort((a, b) => {
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
  })

  const transformedImports = imports.map((node) => {
    return {
      ...node,
      specifiers: node.specifiers.map((specifier) => {
        if (specifier?.imported && specifier.local.name === specifier.imported.name)
          delete specifier.local
        return specifier
      }),
    }
  })

  return {
    ...ast,
    body: [...transformedImports, ...nonImports],
  }
}

export { sortImportsByComponent }
