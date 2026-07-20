// Vite exposes `import.meta.env.*`, which is valid ESM syntax but has no
// meaning once Babel compiles a module down to CommonJS for Jest. This
// plugin rewrites the `import.meta` meta-property to `process`, so
// `import.meta.env.VITE_FOO` becomes `process.env.VITE_FOO` at test time.
module.exports = function importMetaEnvPlugin({ types: t }) {
  return {
    name: 'transform-import-meta-env-for-jest',
    visitor: {
      MetaProperty(path) {
        if (
          path.node.meta.name === 'import' &&
          path.node.property.name === 'meta'
        ) {
          path.replaceWith(t.identifier('process'))
        }
      },
    },
  }
}
