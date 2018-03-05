import {expect} from 'chai'
import sortSubgraph from 'ciena-dagre/order/sort-subgraph'
import {Graph} from 'ciena-graphlib'
import {beforeEach, describe, it} from 'mocha'

describe('order/sortSubgraph', function () {
  let g
  let cg

  beforeEach(function () {
    g = new Graph({compound: true})
      .setDefaultNodeLabel(function () { return {} })
      .setDefaultEdgeLabel(function () { return {weight: 1} })
    Array.from(Array(5).keys()).forEach(v => g.setNode(v, {order: v}))
    cg = new Graph()
  })

  it('should sort a flat subgraph based on barycenter', function () {
    g.setEdge(3, 'x')
    g.setEdge(1, 'y', {weight: 2})
    g.setEdge(4, 'y')
    ;['x', 'y'].forEach(v => g.setParent(v, 'movable'))

    expect(sortSubgraph(g, 'movable', cg).vs).eqls(['y', 'x'])
  })

  it('should preserve the pos of a node (y) w/o neighbors in a flat subgraph', function () {
    g.setEdge(3, 'x')
    g.setNode('y')
    g.setEdge(1, 'z', {weight: 2})
    g.setEdge(4, 'z')
    ;['x', 'y', 'z'].forEach(v => g.setParent(v, 'movable'))

    expect(sortSubgraph(g, 'movable', cg).vs).eqls(['z', 'y', 'x'])
  })

  it('should bias to the left without reverse bias', function () {
    g.setEdge(1, 'x')
    g.setEdge(1, 'y')
    ;['x', 'y'].forEach(v => g.setParent(v, 'movable'))

    expect(sortSubgraph(g, 'movable', cg).vs).eqls(['x', 'y'])
  })

  it('should bias to the right with reverse bias', function () {
    g.setEdge(1, 'x')
    g.setEdge(1, 'y')
    ;['x', 'y'].forEach(v => g.setParent(v, 'movable'))

    expect(sortSubgraph(g, 'movable', cg, true).vs).eqls(['y', 'x'])
  })

  it('should aggregate stats about the subgraph', function () {
    g.setEdge(3, 'x')
    g.setEdge(1, 'y', {weight: 2})
    g.setEdge(4, 'y')
    ;['x', 'y'].forEach(v => g.setParent(v, 'movable'))

    const results = sortSubgraph(g, 'movable', cg)
    expect(results.barycenter).to.equal(2.25)
    expect(results.weight).to.equal(4)
  })

  it('should sort a nested subgraph with no barycenter', function () {
    g.setNodes(['a', 'b', 'c'])
    g.setParent('a', 'y')
    g.setParent('b', 'y')
    g.setParent('c', 'y')
    g.setEdge(0, 'x')
    g.setEdge(1, 'z')
    g.setEdge(2, 'y')
    ;['x', 'y', 'z'].forEach(v => g.setParent(v, 'movable'))

    expect(sortSubgraph(g, 'movable', cg).vs).eqls(['x', 'z', 'a', 'b', 'c'])
  })

  it('should sort a nested subgraph with a barycenter', function () {
    g.setNodes(['a', 'b', 'c'])
    g.setParent('a', 'y')
    g.setParent('b', 'y')
    g.setParent('c', 'y')
    g.setEdge(0, 'a', {weight: 3})
    g.setEdge(0, 'x')
    g.setEdge(1, 'z')
    g.setEdge(2, 'y')
    ;['x', 'y', 'z'].forEach(v => g.setParent(v, 'movable'))

    expect(sortSubgraph(g, 'movable', cg).vs).eqls(['x', 'a', 'b', 'c', 'z'])
  })

  it('should sort a nested subgraph with no in-edges', function () {
    g.setNodes(['a', 'b', 'c'])
    g.setParent('a', 'y')
    g.setParent('b', 'y')
    g.setParent('c', 'y')
    g.setEdge(0, 'a')
    g.setEdge(1, 'b')
    g.setEdge(0, 'x')
    g.setEdge(1, 'z')
    ;['x', 'y', 'z'].forEach(v => g.setParent(v, 'movable'))

    expect(sortSubgraph(g, 'movable', cg).vs).eqls(['x', 'a', 'b', 'c', 'z'])
  })

  it('should sort border nodes to the extremes of the subgraph', function () {
    g.setEdge(0, 'x')
    g.setEdge(1, 'y')
    g.setEdge(2, 'z')
    g.setNode('sg1', {borderLeft: 'bl', borderRight: 'br'})
    ;['x', 'y', 'z', 'bl', 'br'].forEach(v => g.setParent(v, 'sg1'))
    expect(sortSubgraph(g, 'sg1', cg).vs).eqls(['bl', 'x', 'y', 'z', 'br'])
  })

  it('should assign a barycenter to a subgraph based on previous border nodes', function () {
    g.setNode('bl1', {order: 0})
    g.setNode('br1', {order: 1})
    g.setEdge('bl1', 'bl2')
    g.setEdge('br1', 'br2')
    ;['bl2', 'br2'].forEach(v => g.setParent(v, 'sg'))
    g.setNode('sg', {borderLeft: 'bl2', borderRight: 'br2'})
    expect(sortSubgraph(g, 'sg', cg)).eqls({
      barycenter: 0.5,
      weight: 2,
      vs: ['bl2', 'br2']
    })
  })
})
