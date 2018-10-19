/* eslint-env node */
const EmberAddon = require('ember-cli/lib/broccoli/ember-addon')

module.exports = function (defaults) {
  const app = new EmberAddon(defaults, {
    babel: {
      plugins: ['transform-object-rest-spread']
    }
  })

  return app.toTree()
}
