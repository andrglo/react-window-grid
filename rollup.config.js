import clear from 'rollup-plugin-clear'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import {terser} from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'
import {sizeSnapshot} from 'rollup-plugin-size-snapshot'
import replace from 'rollup-plugin-replace'
import pkg from './package.json'

const external = id => !id.startsWith('.') && !id.startsWith('/')

export default params => {
  let {configEnv: env} = params
  env = env || 'development'
  const production = env === 'production'
  console.log(`Building for ${env}\n`)
  const sourcemap = production
  let output = [{file: pkg.main, format: 'cjs', sourcemap}]
  if (production) {
    output = [
      ...output,
      {file: pkg.module, format: 'esm', sourcemap},
      {
        file: pkg.browser,
        format: 'umd',
        sourcemap,
        name: 'ReactWindowGrid',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    ]
  }
  return {
    input: './src/ReactWindowGrid.js',
    external,
    output,
    plugins: [
      clear({
        targets: ['dist']
      }),
      resolve(),
      babel({
        exclude: ['node_modules/**']
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env)
      }),
      commonjs(),
      json(),
      sizeSnapshot(),
      (production || env === 'test') && terser()
    ]
  }
}
