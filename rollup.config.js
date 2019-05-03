import clear from 'rollup-plugin-clear'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import {terser} from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'
import pkg from './package.json'

const external = id => !id.startsWith('.')

export default params => {
  const {configProduction: production} = params
  console.log(`Building for ${production ? 'production' : 'development'}\n`)
  const sourcemap = production
  let output = [{file: pkg.main, format: 'cjs', sourcemap}]
  if (production) {
    output = [...output, {file: pkg.module, format: 'esm', sourcemap}]
  }
  return {
    input: 'src/index.js',
    external,
    output,
    plugins: [
      clear({
        targets: ['dist']
      }),
      resolve({
        extensions: ['.mjs', '.js', '.jsx', '.json']
      }),
      babel({
        exclude: ['node_modules/**']
      }),
      commonjs(),
      json(),
      production && terser()
    ]
  }
}
