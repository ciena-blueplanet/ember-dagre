import {expect} from 'chai'
import order from 'ciena-dagre/order'
import crossCount from 'ciena-dagre/order/cross-count'
import {buildLayerMatrix} from 'ciena-dagre/util'
import {Graph} from 'ciena-graphlib'
import {beforeEach, describe, it} from 'mocha'

describe('order', function () {
  let g

  beforeEach(function () {
    g = new Graph()
      .setDefaultEdgeLabel({weight: 1})
  })

  it('should not add crossings to a tree structure', function () {
    g.setNode('a', {rank: 1})
    ;['b', 'e'].forEach(v => g.setNode(v, {rank: 2}))
    ;['c', 'd', 'f'].forEach(v => g.setNode(v, {rank: 3}))
    g.setPath(['a', 'b', 'c'])
    g.setEdge('b', 'd')
    g.setPath(['a', 'e', 'f'])
    order(g)
    const layering = buildLayerMatrix(g)
    expect(crossCount(g, layering)).to.equal(0)
  })

  it('should solve a simple graph', function () {
    // This graph resulted in a single crossing for previous versions of dagre.
    ;['a', 'd'].forEach(v => g.setNode(v, {rank: 1}))
    ;['b', 'f', 'e'].forEach(v => g.setNode(v, {rank: 2}))
    ;['c', 'g'].forEach(v => g.setNode(v, {rank: 3}))
    order(g)
    const layering = buildLayerMatrix(g)
    expect(crossCount(g, layering)).to.equal(0)
  })

  it('should minimize crossings', function () {
    g.setNode('a', {rank: 1})
    ;['b', 'e', 'g'].forEach(v => g.setNode(v, {rank: 2}))
    ;['c', 'f', 'h'].forEach(v => g.setNode(v, {rank: 3}))
    g.setNode('d', {rank: 4})
    order(g)
    const layering = buildLayerMatrix(g)
    expect(crossCount(g, layering)).to.be.lte(1)
  })
})
