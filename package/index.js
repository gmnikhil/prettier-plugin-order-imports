import { sortImportsByComponent } from "./sorter.js"
import typescriptParsers from "prettier/plugins/typescript.js"

const { typescript: defaultTypescriptParser } = typescriptParsers.parsers

export const parsers = {
  typescript: {
    ...defaultTypescriptParser,
    parse: (text, parsers, options) => {
      const ast = defaultTypescriptParser.parse(text, options)
      const sortedAst = sortImportsByComponent(ast, options)
      return sortedAst
    },
  },
}
