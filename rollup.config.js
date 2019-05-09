import clear from 'rollup-plugin-clear'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import {terser} from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'
import {sizeSnapshot} from 'rollup-plugin-size-snapshot'
import replace from 'rollup-plugin-replace'
import pkg from './package.json'

export default () => {
  const env = process.env.NODE_ENV || 'development'
  const production = env === 'production'
  console.log(`Building for ${env}\n`)
  let output = [{file: pkg.main, format: 'cjs'}]
  if (production) {
    output = [
      ...output,
      {file: pkg.module, format: 'esm'},
      {
        file: pkg.browser,
        format: 'umd',
        name: 'ReactWindowGrid',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-window': 'ReactWindow',
          'prop-types': 'PropTypes'
        }
      }
    ]
  }
  return {
    input: './src/ReactWindowGrid.js',
    external: [
      'react', 'react-dom', 'react-window', 'prop-types'
    ],
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
      production && sizeSnapshot(),
      production && terser()
    ]
  }
}
