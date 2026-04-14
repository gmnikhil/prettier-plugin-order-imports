import { sortImportSpecifiersInProgram } from "./import-sort-logic.js"
import { preprocessImportsInSource } from "./preprocess-imports.js"
import { printers } from "./printers.js"
import typescriptParsers from "prettier/plugins/typescript.js"

const { typescript: defaultTypescriptParser } = typescriptParsers.parsers

export const parsers = {
  typescript: {
    ...defaultTypescriptParser,
    preprocess: (text, options) =>
      preprocessImportsInSource(text, options, defaultTypescriptParser.parse.bind(defaultTypescriptParser)),
    parse: (text, options) => {
      const ast = defaultTypescriptParser.parse(text, options)
      sortImportSpecifiersInProgram(ast)
      return ast
    },
  },
}

export { printers }
