import uglify from 'rollup-plugin-uglify'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'dist/browser/index.js',
  name: 'Promise',
  plugins: [resolve(), uglify()],
  output: {
    file: 'dist/promise.min.js',
    format: 'umd'
  }
}
