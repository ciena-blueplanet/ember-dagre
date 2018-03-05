import {expect} from 'chai'
import initOrder from 'ciena-dagre/order/init-order'
import {Graph} from 'ciena-graphlib'
import {beforeEach, describe, it} from 'mocha'

describe('order/initOrder', function () {
  let g

  beforeEach(function () {
    g = new Graph({compound: true})
      .setDefaultEdgeLabel(function () { return {weight: 1} })
  })

  it('should assign non-overlapping orders for each rank in a tree', function () {
    Object.entries({a: 0, b: 1, c: 2, d: 2, e: 1})
      .forEach(([v, rank]) => g.setNode(v, {rank}))
    g.setPath(['a', 'b', 'c'])
    g.setEdge('b', 'd')
    g.setEdge('a', 'e')

    const layering = initOrder(g)
    expect(layering[0]).to.eql(['a'])
    expect(layering[1].sort()).to.eql(['b', 'e'])
    expect(layering[2].sort()).to.eql(['c', 'd'])
  })

  it('should assign non-overlapping orders for each rank in a DAG', function () {
    Object.entries({a: 0, b: 1, c: 1, d: 2})
      .forEach(([v, rank]) => g.setNode(v, {rank}))
    g.setPath(['a', 'b', 'd'])
    g.setPath(['a', 'c', 'd'])

    const layering = initOrder(g)
    expect(layering[0]).to.eql(['a'])
    expect(layering[1].sort()).to.eql(['b', 'c'])
    expect(layering[2].sort()).to.eql(['d'])
  })

  it('should not assign an order to subgraph nodes', function () {
    g.setNode('a', {rank: 0})
    g.setNode('sg1', {})
    g.setParent('a', 'sg1')

    const layering = initOrder(g)
    expect(layering).to.eql([['a']])
  })
})
