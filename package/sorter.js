const sortImportsByComponent = (ast, options) => {
  const imports = ast.body.filter((node) => node.type === "ImportDeclaration")

  const nonImports = ast.body.filter((node) => node.type !== "ImportDeclaration")

  imports.forEach((node) => {
    node.specifiers.sort((a, b) => a.local.name.localeCompare(b.local.name))
  })

  imports.sort((a, b) => {
    if (a.specifiers.length < 2 && b.specifiers.length >= 2) return -1

    if (a.specifiers.length >= 2 && b.specifiers.length < 2) return 1

    const a_specifier = a.specifiers[0].local
    const b_specifier = b.specifiers[0].local

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
