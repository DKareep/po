// Only applies under Jest (BABEL_ENV/NODE_ENV === 'test'). The Vite build
// uses its own esbuild/babel pipeline and never sets that env, so this
// config is a no-op outside of `npm test`.
module.exports = function (api) {
  const isTest = api.env('test')
  api.cache.using(() => isTest)

  if (!isTest) {
    return {}
  }

  return {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      ['@babel/preset-react', { runtime: 'automatic' }],
      '@babel/preset-typescript',
    ],
    plugins: [require.resolve('./test/babel-plugin-import-meta-env.cjs')],
  }
}
