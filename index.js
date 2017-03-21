'use strict'

const Funnel = require('broccoli-funnel')
const mergeTrees = require('broccoli-merge-trees')
const path = require('path')

module.exports = {
  name: 'ciena-dagre',

  /**
   * Workaround needed for 2.12+
   * see: https://github.com/ember-redux/ember-redux/issues/105#issuecomment-288001558
   * @returns {boolean} Set to true to force JS compile
   * @private
   */
  _shouldCompileJS: function () {
    return true
  },

  treeForAddon (tree) {
    const dagrePath = path.dirname(require.resolve('ciena-dagre/src/index.js'))

    const dagreFunnel = new Funnel(dagrePath, {
      include: [
        '**/*.js'
      ]
    })

    if (!tree) {
      return this._super.treeForAddon.call(this, dagreFunnel)
    }

    const trees = mergeTrees([dagreFunnel, tree], {
      overwrite: true
    })

    return this._super.treeForAddon.call(this, trees)
  }
}
