import uglify from 'rollup-plugin-uglify'
import resolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'dist/browser/index.js',
  dest: 'dist/promise.min.js',
  format: 'umd',
  moduleName: 'Promise',
  plugins: [resolve(), uglify()]
}
