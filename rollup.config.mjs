import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'

export default [
  {
    input: './src/ReactWindowGrid.js',
    external: ['react', 'react-dom', 'react-window'],
    output: {
      file: 'dist/react-window-grid.min.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true
      }),
      resolve(),
      babel({
        exclude: ['node_modules/**'],
        plugins: ['transform-react-remove-prop-types'],
        babelHelpers: 'bundled'
      }),
      commonjs(),
      json(),
    ]
  },
  {
    input: './src/ReactWindowGrid.js',
    external: ['react', 'react-dom', 'react-window'],
    output: {file: 'dist/react-window-grid.js', format: 'cjs'},
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV || 'development'
        ),
        preventAssignment: true
      }),
      resolve(),
      babel({
        exclude: ['node_modules/**'],
        babelHelpers: 'bundled'
      }),
      commonjs(),
      json()
    ]
  }
]
