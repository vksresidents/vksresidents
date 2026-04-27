const ts = require('typescript');
const fs = require('fs');
const file = 'src/pages/staff/SecurityPages.tsx';
const text = fs.readFileSync(file, 'utf8');
const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const exports = [];
function visit(node) {
  if (ts.isExportDeclaration(node)) {
    exports.push({ kind: 'exportdecl', text: text.slice(node.pos, node.end) });
  }
  if (ts.isVariableStatement(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
    node.declarationList.declarations.forEach((d) => {
      if (ts.isIdentifier(d.name)) exports.push({ kind: 'var', name: d.name.text });
    });
  }
  if (ts.isFunctionDeclaration(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) && node.name) {
    exports.push({ kind: 'func', name: node.name.text });
  }
  if (ts.isClassDeclaration(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) && node.name) {
    exports.push({ kind: 'class', name: node.name.text });
  }
  ts.forEachChild(node, visit);
}
visit(source);
console.log(JSON.stringify(exports, null, 2));
