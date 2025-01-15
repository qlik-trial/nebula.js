const { declare } = require('@babel/helper-plugin-utils');

const vars = require('../apis/locale/all.json');

const ids = {};
Object.keys(vars).forEach((key) => {
  ids[vars[key].id] = key;
});

const used = [];
const warnings = {};

const warn = (s) => console.warn(`\x1b[43m\x1b[30m WARN \x1b[0m \x1b[1m\x1b[33m ${s}\x1b[0m`);

const find = declare((/* api, options */) => {
  function useString(id) {
    if (used.indexOf(id) !== -1) {
      return;
    }

    used.push(id);

    if (typeof ids[id] === 'undefined') {
      warn(`String '${id}' does not exist in locale registry`);
    }
  }
  return {
    name: 'find',
    visitor: {
      CallExpression(path) {
        if (!path.get('callee').isMemberExpression()) {
          return;
        }
        if (
          path.node.callee.object &&
          path.node.callee.object.name === 'translator' &&
          path.node.callee.property &&
          path.node.callee.property.name === 'get'
        ) {
          const { type, value } = path.node.arguments[0];
          if (type === 'StringLiteral') {
            useString(value, path);
          } else {
            const s = `${this.file.opts.filename}:${path.node.loc.start.line}:${path.node.loc.start.column}`;
            if (!warnings[s]) {
              warnings[s] = true;
              warn(`Could not verify used string at ${s}`);
            }
          }
        }
      },
    },
  };
});

module.exports = find;
