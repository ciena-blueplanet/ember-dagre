'use strict'

const Funnel = require('broccoli-funnel')
const mergeTrees = require('broccoli-merge-trees')
const path = require('path')

module.exports = {
  name: 'dagre',

  treeForAddon (tree) {
    const dagrePath = path.dirname(require.resolve('dagre/index.js'))

    const dagreFunnel = new Funnel(dagrePath, {
      include: [
        'lib/**/*.js',
        'index.js'
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
