const parser = require("@typescript-eslint/typescript-estree");
const { sortImportsByComponent } = require("./sorter");

module.exports = {
  parsers: {
    typescript: {
      parse: (text, parsers, options) => {
        const ast = parser.parse(text, {
          ...options,
          loc: true,
          range: true,
          jsx: true,
        });
        const sortedAst = sortImportsByComponent(ast, options);
        return sortedAst;
      },
      astFormat: "estree",

      locStart: (node) => node.loc.start,
      locEnd: (node) => node.loc.end,
    },
  },
};
