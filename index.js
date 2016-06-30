'use strict'

const mergeTrees = require('broccoli-merge-trees')
const path = require('path')

module.exports = {
  name: 'dagre',

  treeForAddon (tree) {
    const dagrePath = path.dirname(require.resolve('dagre/index.js'))
    const dagreTree = this.treeGenerator(dagrePath)
    const trees = mergeTrees([dagreTree, tree], {
      overwrite: true
    })

    return this._super.treeForAddon.call(this, trees)
  }
}
