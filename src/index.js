if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
  module.exports = require('../dist/react-window-grid.min.js')
} else {
  module.exports = require('../dist/react-window-grid.js')
}
